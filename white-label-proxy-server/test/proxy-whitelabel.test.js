'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { startStubUpstream, startProxy } = require('./helpers')
const { findYunoUrls } = require('../lib/html-rewrite')

// The checkout shell as the sdk-checkout build publishes it: every asset URL
// is absolute on the Yuno host (PUBLIC_URL), which is exactly what must not
// reach a white-labeled merchant page.
const CHECKOUT_INDEX_HTML = `<!doctype html><html><head>
<link rel="icon" href="https://checkout.sandbox.y.uno/favicon.ico">
<link rel="manifest" href="https://checkout.sandbox.y.uno/manifest.json">
<link rel="stylesheet" href="https://checkout.sandbox.y.uno/static/css/main.9a1.css">
<link rel="stylesheet" href="https://sdk.prod.y.uno/css/fonts.css">
<script defer src="https://checkout.sandbox.y.uno/static/js/main.4f2.js"></script>
<script defer src="https://sdk-web.y.uno/v1.10/main.js"></script>
</head><body><div id="root"></div>
<img src="https://icons.prod.y.uno/flags/co.svg">
</body></html>`

// The 3DS challenge page as the micro-app publishes it: root-relative asset
// URLs that lose the merchant's sub-path unless the proxy re-anchors them.
const CHALLENGE_HTML = `<!doctype html><html><head>
<script type="module" src="/assets/challenge-DeAdBeEf.js"></script>
<script type="module" src="/assets/index-A1b2C3.js"></script>
<link rel="stylesheet" href="/assets/challenge-C0ffee.css">
<link rel="preload" href="https://sdk.prod.y.uno/css/fonts.css">
</head><body><form action="/session-id.html"></form></body></html>`

const BASE_PATH = '/hosted-payment-methods/hosted-payment-form/orchestrator'

async function setup({ basePath }) {
  const checkout = await startStubUpstream(
    {
      '/index.html': { body: CHECKOUT_INDEX_HTML, contentType: 'text/html; charset=utf-8' },
      '/static/js/main.4f2.js': { body: 'console.log("checkout bundle")', contentType: 'application/javascript' },
      '/favicon.ico': { body: 'icon-bytes', contentType: 'image/x-icon' },
    },
    'checkout',
  )
  const threeDs = await startStubUpstream(
    {
      '/challenge.html': { body: CHALLENGE_HTML, contentType: 'text/html; charset=utf-8' },
      '/redirect.html': { body: CHALLENGE_HTML, contentType: 'text/html; charset=utf-8' },
      '/session-id.html': { body: CHALLENGE_HTML, contentType: 'text/html; charset=utf-8' },
      '/assets/challenge-DeAdBeEf.js': { body: 'challenge-entry', contentType: 'application/javascript' },
      '/assets/index-A1b2C3.js': { body: 'shared-chunk', contentType: 'application/javascript' },
      '/assets/challenge-C0ffee.css': { body: '.a{}', contentType: 'text/css' },
    },
    '3ds',
  )
  const sdk = await startStubUpstream(
    { '/v1.10/main.js': { body: 'sdk-main', contentType: 'application/javascript' } },
    'sdk',
  )
  const staticCdn = await startStubUpstream(
    { '/css/fonts.css': { body: '@font-face{}', contentType: 'text/css' } },
    'static',
  )
  const icons = await startStubUpstream(
    { '/flags/co.svg': { body: '<svg/>', contentType: 'image/svg+xml' } },
    'icons',
  )

  const proxy = await startProxy({
    BASE_PATH: basePath || '',
    CHECKOUT_UPSTREAM: checkout.origin,
    SDK_3DS_UPSTREAM: threeDs.origin,
    SDK_UPSTREAM: sdk.origin,
    SDK_STATIC_UPSTREAM: staticCdn.origin,
    SDK_ICONS_UPSTREAM: icons.origin,
    CHECKOUT_BFF_UPSTREAM: 'http://127.0.0.1:1',
    BACKEND_URL: 'http://127.0.0.1:1',
  })

  return {
    proxy,
    upstreams: { checkout, threeDs, sdk, staticCdn, icons },
    async close() {
      await proxy.close()
      await Promise.all([checkout.close(), threeDs.close(), sdk.close(), staticCdn.close(), icons.close()])
    },
  }
}

test('AC1: a whitelabel-configured org gets zero Yuno-hosted URLs on any SDK-rendered page', async (t) => {
  const ctx = await setup({ basePath: BASE_PATH })
  t.after(() => ctx.close())

  const pages = [
    `${BASE_PATH}/payment?session=abc`,
    `${BASE_PATH}/payment/status?session=abc`,
    `${BASE_PATH}/enroll?session=abc`,
    `${BASE_PATH}/challenge.html`,
    `${BASE_PATH}/redirect.html`,
    `${BASE_PATH}/session-id.html`,
  ]

  for (const page of pages) {
    const res = await fetch(`${ctx.proxy.origin}${page}`)
    assert.equal(res.status, 200, page)
    const html = await res.text()

    assert.deepEqual(findYunoUrls(html), [], `${page} still renders Yuno-hosted URLs`)
    assert.ok(!html.includes('y.uno'), `${page} still mentions a Yuno host`)
  }
})

test('AC1: every asset a whitelabeled page references resolves on the whitelabel origin', async (t) => {
  const ctx = await setup({ basePath: BASE_PATH })
  t.after(() => ctx.close())

  const res = await fetch(`${ctx.proxy.origin}${BASE_PATH}/challenge.html`)
  const html = await res.text()

  // Pull every src/href out of the rendered page and fetch it back through the
  // proxy: this is the "zero Yuno-hosted URL in network requests" criterion.
  const urls = [...html.matchAll(/(?:src|href|action)="([^"]+)"/g)].map((m) => m[1])
  assert.ok(urls.length >= 4)

  for (const url of urls) {
    assert.ok(url.startsWith(`${BASE_PATH}/`), `${url} is not anchored on the whitelabel base path`)
    const assetRes = await fetch(`${ctx.proxy.origin}${url}`)
    assert.equal(assetRes.status, 200, `${url} did not resolve through the whitelabel origin`)
  }
})

test('AC1: the checkout shell bundle is re-anchored on the whitelabel origin and resolves', async (t) => {
  const ctx = await setup({ basePath: BASE_PATH })
  t.after(() => ctx.close())

  const res = await fetch(`${ctx.proxy.origin}${BASE_PATH}/payment?session=abc`)
  const html = await res.text()

  assert.ok(html.includes(`src="${BASE_PATH}/static/js/main.4f2.js"`))
  assert.ok(html.includes(`href="${BASE_PATH}/favicon.ico"`))
  assert.ok(html.includes(`src="${BASE_PATH}/v1.10/main.js"`))
  assert.ok(html.includes(`href="${BASE_PATH}/css/fonts.css"`))
  assert.ok(html.includes(`src="${BASE_PATH}/flags/co.svg"`))

  const bundle = await fetch(`${ctx.proxy.origin}${BASE_PATH}/static/js/main.4f2.js`)
  assert.equal(bundle.status, 200)
  assert.equal(bundle.headers.get('x-white-label-proxy'), 'checkout')
  assert.equal(await bundle.text(), 'console.log("checkout bundle")')
})

test('ZPY-758: shared 3DS build chunks are served from the 3DS upstream, not the SDK upstream', async (t) => {
  const ctx = await setup({ basePath: BASE_PATH })
  t.after(() => ctx.close())

  const shared = await fetch(`${ctx.proxy.origin}${BASE_PATH}/assets/index-A1b2C3.js`)

  assert.equal(shared.status, 200)
  assert.equal(shared.headers.get('x-white-label-proxy'), '3ds')
  assert.equal(await shared.text(), 'shared-chunk')
  assert.ok(!ctx.upstreams.sdk.requests.includes('/assets/index-A1b2C3.js'))
  assert.ok(ctx.upstreams.threeDs.requests.includes('/assets/index-A1b2C3.js'))
})

test('non-HTML upstream responses are streamed through untouched', async (t) => {
  const ctx = await setup({ basePath: BASE_PATH })
  t.after(() => ctx.close())

  const svg = await fetch(`${ctx.proxy.origin}${BASE_PATH}/flags/co.svg`)

  assert.equal(svg.status, 200)
  assert.equal(svg.headers.get('x-white-label-proxy'), 'icons')
  assert.equal(svg.headers.get('content-type'), 'image/svg+xml')
  assert.equal(await svg.text(), '<svg/>')
})

test('default (non-whitelabel) org routing is unchanged at the root mount', async (t) => {
  const ctx = await setup({ basePath: '' })
  t.after(() => ctx.close())

  const checkout = await fetch(`${ctx.proxy.origin}/payment?session=abc`)
  assert.equal(checkout.status, 200)
  assert.equal(checkout.headers.get('x-white-label-proxy'), 'checkout')
  const html = await checkout.text()
  // No base path to add, but Yuno origins are still stripped to root-relative.
  assert.deepEqual(findYunoUrls(html), [])
  assert.ok(html.includes('src="/static/js/main.4f2.js"'))
  assert.ok(html.includes('href="/favicon.ico"'))

  const challenge = await fetch(`${ctx.proxy.origin}/challenge.html`)
  assert.equal(challenge.status, 200)
  assert.equal(challenge.headers.get('x-white-label-proxy'), '3ds')
  const challengeHtml = await challenge.text()
  assert.ok(challengeHtml.includes('src="/assets/challenge-DeAdBeEf.js"'))
  assert.deepEqual(findYunoUrls(challengeHtml), [])

  const main = await fetch(`${ctx.proxy.origin}/v1.10/main.js`)
  assert.equal(main.status, 200)
  assert.equal(main.headers.get('x-white-label-proxy'), 'sdk')
  assert.equal(await main.text(), 'sdk-main')

  const info = await fetch(`${ctx.proxy.origin}/whitelabel-info`)
  assert.equal(info.status, 200)
  assert.equal((await info.json()).basePath, null)

  const landing = await fetch(`${ctx.proxy.origin}/`)
  assert.equal(landing.status, 200)
  assert.ok((await landing.text()).includes('White-label SDK proxy'))
})
