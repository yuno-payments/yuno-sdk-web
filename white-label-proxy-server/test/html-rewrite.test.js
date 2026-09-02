'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { createHtmlRewriter, findYunoUrls, isHtmlContentType } = require('../lib/html-rewrite')

test('strips every absolute Yuno origin from a served document', () => {
  const rewrite = createHtmlRewriter('')
  const html = [
    '<script src="https://checkout.sandbox.y.uno/static/js/main.js"></script>',
    '<script src="https://sdk-web.y.uno/v1.10/main.js"></script>',
    '<link href="https://sdk.prod.y.uno/css/fonts.css">',
    '<img src="https://icons.prod.y.uno/flags/co.svg">',
    '<a href="https://y.uno/legal">terms</a>',
  ].join('\n')

  const out = rewrite(html)

  assert.equal(findYunoUrls(out).length, 0)
  assert.ok(out.includes('src="/static/js/main.js"'))
  assert.ok(out.includes('src="/v1.10/main.js"'))
  assert.ok(out.includes('href="/css/fonts.css"'))
  assert.ok(out.includes('src="/flags/co.svg"'))
  assert.ok(out.includes('href="/legal"'))
})

test('strips a Yuno origin that carries an explicit port', () => {
  const rewrite = createHtmlRewriter('')
  const out = rewrite('<script src="https://checkout.dev.y.uno:8443/static/js/app.js"></script>')

  assert.equal(findYunoUrls(out).length, 0)
  assert.ok(out.includes('src="/static/js/app.js"'))
})

test('leaves a non-Yuno origin untouched', () => {
  const rewrite = createHtmlRewriter('')
  const html = '<script src="https://merchant.example.com/app.js"></script><img src="https://y.uno.evil.com/x.png">'

  assert.equal(rewrite(html), html)
})

test('re-anchors root-relative asset URLs under the configured base path', () => {
  const rewrite = createHtmlRewriter('/hosted-payment-methods/orchestrator')
  const html = [
    '<script type="module" src="/assets/challenge-DeAdBeEf.js"></script>',
    '<link rel="stylesheet" href="/assets/index-C0ffee.css">',
    '<form action="/challenge.html"></form>',
  ].join('\n')

  const out = rewrite(html)

  assert.ok(out.includes('src="/hosted-payment-methods/orchestrator/assets/challenge-DeAdBeEf.js"'))
  assert.ok(out.includes('href="/hosted-payment-methods/orchestrator/assets/index-C0ffee.css"'))
  assert.ok(out.includes('action="/hosted-payment-methods/orchestrator/challenge.html"'))
})

test('re-anchors a URL that was absolute on a Yuno host under the base path', () => {
  const rewrite = createHtmlRewriter('/wl')
  const out = rewrite('<script src="https://checkout.sandbox.y.uno/static/js/main.js"></script>')

  assert.equal(findYunoUrls(out).length, 0)
  assert.ok(out.includes('src="/wl/static/js/main.js"'))
})

test('does not touch protocol-relative or already-prefixed URLs', () => {
  const rewrite = createHtmlRewriter('/wl')
  const html = '<script src="//cdn.example.com/a.js"></script><img src="./local.png">'

  assert.equal(rewrite(html), html)
})

test('leaves documents unchanged when no base path is configured', () => {
  const rewrite = createHtmlRewriter('')
  const html = '<script src="/assets/challenge-abc.js"></script><img src="/flags/co.svg">'

  assert.equal(rewrite(html), html)
})

test('recognises only HTML content types for rewriting', () => {
  assert.equal(isHtmlContentType('text/html; charset=utf-8'), true)
  assert.equal(isHtmlContentType('text/html'), true)
  assert.equal(isHtmlContentType('application/javascript'), false)
  assert.equal(isHtmlContentType('image/svg+xml'), false)
  assert.equal(isHtmlContentType(undefined), false)
})

test('reports the distinct Yuno URLs still present in a document', () => {
  const leaked = findYunoUrls('<a href="https://sdk-web.y.uno/x"></a><a href="https://sdk-web.y.uno/y"></a>')

  assert.equal(leaked.length, 2)
  assert.equal(new Set(leaked).size, 1)
})
