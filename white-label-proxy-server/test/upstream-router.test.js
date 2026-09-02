'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { createUpstreamRouter } = require('../lib/upstream-router')

const UPSTREAMS = {
  sdk: 'https://sdk-web.y.uno',
  card: 'https://sdk-web-card.y.uno',
  threeDs: 'https://sdk-3ds.y.uno',
  static: 'https://sdk.prod.y.uno',
  icons: 'https://icons.prod.y.uno',
  checkout: 'https://checkout.sandbox.y.uno',
}

const router = createUpstreamRouter(UPSTREAMS)

test('routes the 3DS pages to the 3DS upstream', () => {
  for (const p of ['/challenge.html', '/redirect.html', '/session-id.html']) {
    assert.equal(router.pickUpstream(p), UPSTREAMS.threeDs, p)
  }
})

test('routes every root-level 3DS build asset to the 3DS upstream', () => {
  const paths = [
    '/assets/challenge-DeAdBeEf.js',
    '/assets/redirect-C0ffee.js',
    '/assets/session-id-Ba5eBa11.js',
    '/assets/validate-url.js',
    // Shared chunks the Vite build emits alongside the named entries. These
    // previously fell through to the main SDK upstream and 404'd.
    '/assets/index-A1b2C3.js',
    '/assets/vendor-D4e5F6.js',
    '/assets/challenge-A1b2C3.css',
    '/assets/polyfills-legacy-9z8y.js',
  ]
  for (const p of paths) {
    assert.equal(router.pickUpstream(p), UPSTREAMS.threeDs, p)
  }
})

test('routes 3DS assets requested with a query string', () => {
  assert.equal(router.pickUpstream('/assets/index-A1b2C3.js?v=2'), UPSTREAMS.threeDs)
})

test('keeps the card micro-app on the card upstream', () => {
  assert.equal(router.pickUpstream('/v1.84.1/pages/secured-fields.html'), UPSTREAMS.card)
  assert.equal(router.pickUpstream('/v1.84.1/assets/card-form.js'), UPSTREAMS.card)
  assert.equal(router.pickUpstream('/v2.0.0-rc.1/assets/card.js'), UPSTREAMS.card)
})

test('keeps existing non-3DS routing unchanged', () => {
  assert.equal(router.pickUpstream('/v1.10/main.js'), UPSTREAMS.sdk)
  assert.equal(router.pickUpstream('/icons/visa.svg'), UPSTREAMS.static)
  assert.equal(router.pickUpstream('/css/fonts.css'), UPSTREAMS.static)
  assert.equal(router.pickUpstream('/brands/x.svg'), UPSTREAMS.static)
  assert.equal(router.pickUpstream('/c2p/y.svg'), UPSTREAMS.static)
  assert.equal(router.pickUpstream('/sdk-web/logo.svg'), UPSTREAMS.icons)
  assert.equal(router.pickUpstream('/flags/co.svg'), UPSTREAMS.icons)
  assert.equal(router.pickUpstream('/Visa.png'), UPSTREAMS.icons)
  assert.equal(router.pickUpstream('/static/js/main.abc.js'), UPSTREAMS.checkout)
  assert.equal(router.pickUpstream('/favicon.ico'), UPSTREAMS.checkout)
  assert.equal(router.pickUpstream('/manifest.json'), UPSTREAMS.checkout)
})

test('labels each upstream for the response header', () => {
  assert.equal(router.labelFor(UPSTREAMS.checkout), 'checkout')
  assert.equal(router.labelFor(UPSTREAMS.threeDs), '3ds')
  assert.equal(router.labelFor(UPSTREAMS.card), 'card')
  assert.equal(router.labelFor(UPSTREAMS.static), 'static')
  assert.equal(router.labelFor(UPSTREAMS.icons), 'icons')
  assert.equal(router.labelFor(UPSTREAMS.sdk), 'sdk')
})

test('labels a collapsed upstream as the SDK when it equals SDK_UPSTREAM', () => {
  const collapsed = createUpstreamRouter({ ...UPSTREAMS, threeDs: UPSTREAMS.sdk, card: UPSTREAMS.sdk })

  assert.equal(collapsed.labelFor(UPSTREAMS.sdk), 'sdk')
})

test('normalizes the SDK version segment to the published build', () => {
  assert.equal(router.normalizeSdkPath('/v1.100/main.js', '1.10'), '/v1.10/main.js')
  assert.equal(router.normalizeSdkPath('/v1.10/main.js', '1.10'), '/v1.10/main.js')
})

test('leaves card and unversioned paths out of version normalization', () => {
  assert.equal(router.normalizeSdkPath('/v1.84.1/assets/card.js', '1.10'), '/v1.84.1/assets/card.js')
  assert.equal(router.normalizeSdkPath('/challenge.html', '1.10'), '/challenge.html')
  assert.equal(router.normalizeSdkPath('/v1.100/main.js', null), '/v1.100/main.js')
})
