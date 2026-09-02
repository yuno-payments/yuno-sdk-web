'use strict'

// Matches /v<version>/(pages|assets)/... where <version> is any dot-separated
// number sequence (v1.7, v1.84.1, v2.0.0-rc.1, …).
const CARD_ASSET_RE = /^\/v[\d.]+(?:-[\w.]+)?\/(?:pages|assets)\//
// Matches /v<version>/<rest> generally (used for version normalization).
const SDK_VERSION_RE = /^\/v[\d.]+(?:-[\w.]+)?\//
// 3DS top-level pages routed to the 3DS upstream.
const SDK_3DS_PATHS = new Set(['/challenge.html', '/redirect.html', '/session-id.html'])
// Every root-level /assets/* file belongs to the 3DS micro-app: the main SDK
// bundle is served from /v<semver>/*, and the card micro-app from
// /v<semver>/assets/*, which is matched by CARD_ASSET_RE before this. The
// build emits hashed entry chunks (challenge-<hash>.js) *and* shared chunks
// (index-<hash>.js, vendor-<hash>.js, *.css) whose names are not predictable,
// so an entry-name allowlist sends the shared chunks to the wrong upstream.
const SDK_3DS_ASSET_RE = /^\/assets\//
// Host-swapped static-asset paths (CORECM-17664).
const SDK_STATIC_RE = /^\/(?:icons|css|brands|c2p)\//
const SDK_ICONS_RE = /^\/(?:sdk-web|flags)\//
// Bare brand images at the root (e.g. /Visa.png, /boleto_logosimbolo.png) live
// on icons.prod.y.uno. `?react` and other queries are tolerated.
const ROOT_IMAGE_RE = /^\/[^/]+\.(?:png|svg|jpe?g|gif|webp)(?:\?.*)?$/i
// sdk-checkout react-router routes (all serve the SPA index.html): /payment,
// /payment/status, /enroll.
const CHECKOUT_ROUTE_RE = /^\/(?:payment|enroll)(?:\/[^?]*)?$/
// sdk-checkout CRA bundle. Root public files (favicon/manifest/robots) are
// matched separately so they don't collide with the SDK's bare-image rule.
const CHECKOUT_ASSET_RE = /^\/static\/(?:js|css|media)\//
const CHECKOUT_ROOT_FILES = new Set(['/favicon.ico', '/manifest.json', '/robots.txt', '/asset-manifest.json'])

function isCheckoutAsset(reqPath) {
  return CHECKOUT_ASSET_RE.test(reqPath) || CHECKOUT_ROOT_FILES.has(reqPath)
}

function is3dsPath(reqPath) {
  return SDK_3DS_PATHS.has(reqPath) || SDK_3DS_ASSET_RE.test(reqPath)
}

// `upstreams` carries the resolved bases: sdk, card, threeDs, static, icons,
// checkout. Returns { pickUpstream, labelFor, normalizeSdkPath }.
function createUpstreamRouter(upstreams) {
  const { sdk, card, threeDs, static: staticAssets, icons, checkout } = upstreams

  function pickUpstream(reqPath) {
    const pathname = String(reqPath).split('?')[0]
    if (isCheckoutAsset(pathname)) return checkout
    if (is3dsPath(pathname)) return threeDs
    if (CARD_ASSET_RE.test(pathname)) return card
    if (SDK_STATIC_RE.test(pathname)) return staticAssets
    if (SDK_ICONS_RE.test(pathname) || ROOT_IMAGE_RE.test(pathname)) return icons
    return sdk
  }

  function labelFor(upstreamBase) {
    if (upstreamBase === checkout) return 'checkout'
    if (upstreamBase === threeDs && threeDs !== sdk) return '3ds'
    if (upstreamBase === card && card !== sdk) return 'card'
    if (upstreamBase === staticAssets && staticAssets !== sdk) return 'static'
    if (upstreamBase === icons && icons !== sdk) return 'icons'
    return 'sdk'
  }

  // Normalize the version segment of an SDK upstream path so partners can
  // reference any version they like (e.g. /v1.100/main.js) and still get the
  // build the upstream actually publishes (e.g. /v1.10/main.js). Card paths
  // are left alone since the card upstream has its own versioning.
  function normalizeSdkPath(originalUrl, resolvedVersion) {
    if (CARD_ASSET_RE.test(originalUrl)) return originalUrl
    if (!SDK_VERSION_RE.test(originalUrl)) return originalUrl
    if (!resolvedVersion) return originalUrl
    return originalUrl.replace(SDK_VERSION_RE, `/v${resolvedVersion}/`)
  }

  return { pickUpstream, labelFor, normalizeSdkPath }
}

module.exports = {
  createUpstreamRouter,
  isCheckoutAsset,
  is3dsPath,
  CARD_ASSET_RE,
  SDK_VERSION_RE,
  SDK_3DS_PATHS,
  SDK_3DS_ASSET_RE,
  SDK_STATIC_RE,
  SDK_ICONS_RE,
  ROOT_IMAGE_RE,
  CHECKOUT_ROUTE_RE,
  CHECKOUT_ASSET_RE,
  CHECKOUT_ROOT_FILES,
}
