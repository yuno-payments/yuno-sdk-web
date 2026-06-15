const express = require('express')
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const httpProxy = require('http-proxy')

require('dotenv').config()

const PORT = Number(process.env.PORT) || 9090
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '')
const BACKEND_WS_URL = (process.env.BACKEND_WS_URL || BACKEND_URL).replace(/\/$/, '')
const SDK_UPSTREAM = (process.env.SDK_UPSTREAM || 'https://sdk-web.y.uno').replace(/\/$/, '')
// Card-form / secure-fields micro-app is published independently of the main
// SDK bundle and lives under /v<semver>/pages/* and /v<semver>/assets/*. When
// SDK_CARD_UPSTREAM is set, those requests are routed there instead.
const SDK_CARD_UPSTREAM = (process.env.SDK_CARD_UPSTREAM || SDK_UPSTREAM).replace(/\/$/, '')
// 3DS micro-app (challenge / redirect / session-id pages) is also published
// separately. Defaults to SDK_UPSTREAM when unset.
const SDK_3DS_UPSTREAM = (process.env.SDK_3DS_UPSTREAM || SDK_UPSTREAM).replace(/\/$/, '')
// Static asset CDNs. Since CORECM-17664 the SDK routes its icons/logos/fonts
// through the configured white-label host (host-swap, path preserved), so they
// now arrive here and must be forwarded to the real asset hosts. These are
// always `*.prod.y.uno` in the SDK regardless of environment.
//   sdk.prod.y.uno   → /icons, /css, /brands, /c2p
//   icons.prod.y.uno → /sdk-web, /flags, bare brand images (/Visa.png, …)
const SDK_STATIC_UPSTREAM = (process.env.SDK_STATIC_UPSTREAM || 'https://sdk.prod.y.uno').replace(/\/$/, '')
const SDK_ICONS_UPSTREAM = (process.env.SDK_ICONS_UPSTREAM || 'https://icons.prod.y.uno').replace(/\/$/, '')
// Optional sub-path this proxy is "mounted" under, mirroring a partner gateway
// served from e.g. https://host/hosted-payment-methods/hosted-payment-form/orchestrator.
// Since CORECM-17664 the SDK preserves this prefix on every asset/API/WS request
// (apiUrl/assetUrl carry it), so we strip it here before routing. Empty = root
// mount (default, current behavior unchanged).
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '')

// True when `url` (path, with optional query) sits under BASE_PATH.
function underBasePath(url) {
  return url === BASE_PATH || url.startsWith(`${BASE_PATH}/`) || url.startsWith(`${BASE_PATH}?`)
}

// Strip BASE_PATH from a path+query, keeping it root-relative.
function stripBasePath(url) {
  return url.slice(BASE_PATH.length) || '/'
}

// Matches /v<version>/(pages|assets)/... where <version> is any dot-separated
// number sequence (v1.7, v1.84.1, v2.0.0-rc.1, …).
const CARD_ASSET_RE = /^\/v[\d.]+(?:-[\w.]+)?\/(?:pages|assets)\//
// Matches /v<version>/<rest> generally (used for version normalization).
const SDK_VERSION_RE = /^\/v[\d.]+(?:-[\w.]+)?\//
// 3DS top-level pages routed to SDK_3DS_UPSTREAM.
const SDK_3DS_PATHS = new Set(['/challenge.html', '/redirect.html', '/session-id.html'])
// 3DS hashed assets emitted by the build live under /assets/ with these
// prefixes (e.g. /assets/challenge-DeAdBeEf.js, /assets/validate-url.js).
const SDK_3DS_ASSET_RE = /^\/assets\/(?:challenge|redirect|session-id|validate-url)/
// Host-swapped static-asset paths (CORECM-17664).
const SDK_STATIC_RE = /^\/(?:icons|css|brands|c2p)\//
const SDK_ICONS_RE = /^\/(?:sdk-web|flags)\//
// Bare brand images at the root (e.g. /Visa.png, /boleto_logosimbolo.png) live
// on icons.prod.y.uno. `?react` and other queries are tolerated.
const ROOT_IMAGE_RE = /^\/[^/]+\.(?:png|svg|jpe?g|gif|webp)(?:\?.*)?$/i

function pickSdkUpstream(reqPath) {
  if (SDK_3DS_PATHS.has(reqPath) || SDK_3DS_ASSET_RE.test(reqPath)) return SDK_3DS_UPSTREAM
  if (CARD_ASSET_RE.test(reqPath)) return SDK_CARD_UPSTREAM
  if (SDK_STATIC_RE.test(reqPath)) return SDK_STATIC_UPSTREAM
  if (SDK_ICONS_RE.test(reqPath) || ROOT_IMAGE_RE.test(reqPath)) return SDK_ICONS_UPSTREAM
  return SDK_UPSTREAM
}

function getResolvedSdkVersion() {
  const m = sdkMainJsPath.match(/^\/v([\d.]+(?:-[\w.]+)?)\//)
  return m ? m[1] : null
}

// Normalize the version segment of an SDK upstream path so partners can
// reference any version they like (e.g. /v1.100/main.js) and still get the
// build the upstream actually publishes (e.g. /v1.7/main.js). Card paths are
// left alone since the card upstream has its own versioning.
function normalizeSdkPath(originalUrl) {
  if (CARD_ASSET_RE.test(originalUrl)) return originalUrl
  if (!SDK_VERSION_RE.test(originalUrl)) return originalUrl
  const resolved = getResolvedSdkVersion()
  if (!resolved) return originalUrl
  return originalUrl.replace(SDK_VERSION_RE, `/v${resolved}/`)
}

// Resolved at boot. SDK_MAIN_JS env override wins; otherwise we fetch the
// upstream's versions.json and use `latest.version`. Falls back to /v1.7.
let sdkMainJsPath = process.env.SDK_MAIN_JS || '/v1.7/main.js'

const app = express()

const pagesDir = path.join(__dirname, 'pages')
const staticDir = path.join(__dirname, 'static')

// Strip the configured base path first so every downstream route match and
// upstream forward operates on root-relative paths. No-op when BASE_PATH is
// unset (root mount).
if (BASE_PATH) {
  app.use((req, _res, next) => {
    if (underBasePath(req.url)) {
      req.url = stripBasePath(req.url)
      req.originalUrl = stripBasePath(req.originalUrl)
    }
    next()
  })
}

app.use(express.json({ limit: '5mb' }))

// Permissive CORS: echo the caller's origin (so credentialed requests work)
// and short-circuit preflights. Upstream CORS headers are filtered out below
// so they can't override these.
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    res.set('access-control-allow-origin', origin)
    res.set('access-control-allow-credentials', 'true')
    res.set('vary', 'origin')
  } else {
    res.set('access-control-allow-origin', '*')
  }
  res.set('access-control-allow-methods', req.headers['access-control-request-method'] || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.set('access-control-allow-headers', req.headers['access-control-request-headers'] || '*')
  res.set('access-control-expose-headers', '*')
  res.set('access-control-max-age', '86400')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
})

// ---- partner site (test pages) -------------------------------------------

const htmlCache = new Map()
function sendPage(name, res) {
  let html = htmlCache.get(name)
  if (!html) {
    html = fs.readFileSync(path.join(pagesDir, name), 'utf8')
    htmlCache.set(name, html)
  }
  res.set('content-type', 'text/html; charset=utf-8')
  res.send(html.replace(/__SDK_MAIN_JS__/g, `${BASE_PATH}${sdkMainJsPath}`))
}

app.get('/', (_req, res) => sendPage('index.html', res))
app.use('/static', express.static(staticDir))

app.get('/whitelabel-info', (_req, res) => {
  res.json({
    proxyPort: PORT,
    basePath: BASE_PATH || null,
    backend: BACKEND_URL,
    sdkUpstream: SDK_UPSTREAM,
    sdkCardUpstream: SDK_CARD_UPSTREAM,
    sdk3dsUpstream: SDK_3DS_UPSTREAM,
    sdkStaticUpstream: SDK_STATIC_UPSTREAM,
    sdkIconsUpstream: SDK_ICONS_UPSTREAM,
    sdkMainJsPath,
  })
})

// ---- SDK API pass-through (to BACKEND_URL) -------------------------------
//
// Every path the SDK calls in sdk-web-core/src/api/public-sdk/public-sdk.ts
// lives under /v1/* or /v2/*. Forwarding these lets BACKEND_URL act as a
// stand-in for `api.y.uno` while the SDK is hosted under this white-label
// origin.

app.all('/v1/*', forwardToBackend)
app.all('/v2/*', forwardToBackend)

// Headers that must not be copied across a hop (RFC 7230 §6.1) plus a few we
// recompute or that node-fetch sets itself.
const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
])

function pickRequestHeaders(req) {
  const out = {}
  for (const [k, v] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) out[k] = v
  }
  return out
}

async function forwardToBackend(req, res) {
  const targetUrl = `${BACKEND_URL}${req.originalUrl}`
  try {
    const headers = pickRequestHeaders(req)
    // Don't forward the partner page's browser cookies to the Yuno API. They
    // belong to this (localhost) origin — WorkOS `wos-session`, analytics,
    // `spage`, etc. — and a real cross-origin call to api.y.uno would never
    // carry them. The API authenticates via public-api-key; forwarding these
    // only risks the upstream WAF rejecting the request (URL-valued cookies
    // like `spage` trigger a 403).
    delete headers.cookie
    const init = { method: req.method, headers }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // express.json() consumed the original body; re-serialize. SDK API and
      // demo backend both speak JSON, so this is fine.
      const hasBody = req.body && Object.keys(req.body).length > 0
      init.body = hasBody ? JSON.stringify(req.body) : undefined
      if (hasBody && !headers['content-type']) headers['content-type'] = 'application/json'
    }
    const upstream = await fetch(targetUrl, init)
    res.status(upstream.status)
    for (const [k, v] of upstream.headers.entries()) {
      const lk = k.toLowerCase()
      if (HOP_BY_HOP.has(lk)) continue
      if (lk.startsWith('access-control-')) continue
      res.set(k, v)
    }
    res.set('x-white-label-proxy', 'backend')
    const body = await upstream.text()
    res.send(body)
  } catch (err) {
    console.error(`[backend-proxy] ${req.method} ${targetUrl} →`, err.message)
    res.status(502).json({ error: 'backend_unreachable', target: targetUrl, detail: err.message })
  }
}

// ---- SDK assets (white-label host) ---------------------------------------
//
// The whole point of the proxy: the SDK is loaded from THIS origin, not from
// sdk-web.y.uno. Every GET that didn't match a route above is transparently
// forwarded to SDK_UPSTREAM. Registered last so it doesn't shadow / or /static.

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  proxyToUpstream(req, res, next)
})

function labelForUpstream(upstreamBase) {
  if (upstreamBase === SDK_3DS_UPSTREAM && SDK_3DS_UPSTREAM !== SDK_UPSTREAM) return '3ds'
  if (upstreamBase === SDK_CARD_UPSTREAM && SDK_CARD_UPSTREAM !== SDK_UPSTREAM) return 'card'
  if (upstreamBase === SDK_STATIC_UPSTREAM && SDK_STATIC_UPSTREAM !== SDK_UPSTREAM) return 'static'
  if (upstreamBase === SDK_ICONS_UPSTREAM && SDK_ICONS_UPSTREAM !== SDK_UPSTREAM) return 'icons'
  return 'sdk'
}

async function proxyToUpstream(req, res, next) {
  const upstreamBase = pickSdkUpstream(req.path)
  const upstreamLabel = labelForUpstream(upstreamBase)
  const targetPath = upstreamLabel === 'sdk' ? normalizeSdkPath(req.originalUrl) : req.originalUrl
  const targetUrl = `${upstreamBase}${targetPath}`
  if (targetPath !== req.originalUrl) {
    console.log(`[${upstreamLabel}-proxy] rewrote ${req.originalUrl} → ${targetPath}`)
  }
  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        accept: req.headers.accept || '*/*',
        'user-agent': req.headers['user-agent'] || 'white-label-proxy',
      },
    })
    if (upstream.status === 404) return next()
    res.status(upstream.status)
    const passthroughHeaders = ['content-type', 'cache-control', 'etag', 'last-modified']
    for (const h of passthroughHeaders) {
      const v = upstream.headers.get(h)
      if (v) res.set(h, v)
    }
    res.set('x-white-label-proxy', upstreamLabel)
    upstream.body.pipe(res)
  } catch (err) {
    console.error(`[${upstreamLabel}-proxy] GET ${targetUrl} →`, err.message)
    res.status(502).send(`SDK upstream error: ${err.message}`)
  }
}

app.use((_req, res) => res.status(404).send('Not found'))

// ---- WebSocket upgrades --------------------------------------------------
//
// Express middleware never sees `Upgrade` requests; they have to be handled
// on the underlying http.Server. Backend WS (`/v1/*`, `/v2/*`) goes to
// BACKEND_URL; everything else follows the same SDK/card split as HTTP.

const wsProxy = httpProxy.createProxyServer({ changeOrigin: true, ws: true })

wsProxy.on('error', (err, req, socket) => {
  console.error(`[ws-proxy] ${req && req.url} →`, err.message)
  if (socket && !socket.destroyed) socket.destroy()
})

const BACKEND_WS_PATHS = [
  '/checkout-websocket-notification-ms/ws/payment',
  '/checkout-websocket-notification-ms/ws/enrollment',
]

function pickWsTarget(reqUrl) {
  const pathname = reqUrl.split('?')[0]
  if (BACKEND_WS_PATHS.includes(pathname)) return BACKEND_WS_URL
  return pickSdkUpstream(reqUrl)
}

// ---- boot -----------------------------------------------------------------

async function detectSdkMainJs() {
  if (process.env.SDK_MAIN_JS) return
  try {
    const r = await fetch(`${SDK_UPSTREAM}/versions.json`, { timeout: 5000 })
    if (!r.ok) return
    const v = (await r.json())?.latest?.version
    if (v) sdkMainJsPath = `/v${v}/main.js`
  } catch (e) {
    console.warn(`[sdk-version] could not read ${SDK_UPSTREAM}/versions.json: ${e.message}`)
  }
}

detectSdkMainJs().finally(() => {
  const server = app.listen(PORT, () => {
    console.log('================================================================')
    console.log(' white-label-proxy-server')
    console.log('----------------------------------------------------------------')
    console.log(` Listening on    : http://localhost:${PORT}`)
    console.log(` Base path       : ${BASE_PATH || '(root)'}`)
    console.log(` SDK upstream    : ${SDK_UPSTREAM}`)
    console.log(` SDK card upstream: ${SDK_CARD_UPSTREAM}${SDK_CARD_UPSTREAM === SDK_UPSTREAM ? ' (same as SDK upstream)' : ''}`)
    console.log(` SDK 3DS upstream: ${SDK_3DS_UPSTREAM}${SDK_3DS_UPSTREAM === SDK_UPSTREAM ? ' (same as SDK upstream)' : ''}`)
    console.log(` SDK static asset: ${SDK_STATIC_UPSTREAM}  (/icons, /css, /brands, /c2p)`)
    console.log(` SDK icons asset : ${SDK_ICONS_UPSTREAM}  (/sdk-web, /flags, /*.png)`)
    console.log(` SDK main.js     : ${sdkMainJsPath}`)
    console.log(` Backend (API)   : ${BACKEND_URL}`)
    console.log(` Backend (WS)    : ${BACKEND_WS_URL}${BACKEND_WS_URL === BACKEND_URL ? ' (same as backend)' : ''}`)
    console.log('----------------------------------------------------------------')
    console.log(' Make sure the main yuno-sdk-web server is running on 8080')
    console.log(' (cd .. && npm run start:dev) so backend calls succeed.')
    console.log('================================================================')
  })

  server.on('upgrade', (req, socket, head) => {
    if (BASE_PATH && underBasePath(req.url)) {
      req.url = stripBasePath(req.url)
    }
    const target = pickWsTarget(req.url)
    wsProxy.ws(req, socket, head, { target })
  })
})
