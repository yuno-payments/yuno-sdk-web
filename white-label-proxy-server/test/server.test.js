// Smoke tests: boot server.js as a child process against a fake upstream and
// check what reaches the upstream and what goes back to the browser.
// Run with `npm test` (node --test, no extra dependencies).
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const http = require('node:http')
const net = require('node:net')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')

const SERVER = path.join(__dirname, '..', 'server.js')

// Requests the fake upstream received, newest last.
const seen = []
let upstream
let upstreamUrl

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer()
    s.on('error', reject)
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })
}

function fakeUpstream(req, res) {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => {
    seen.push({ method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks) })
    if (req.url.startsWith('/kcp-webhook/truncated')) {
      // Promise 100000 bytes, send a few, then drop the connection.
      res.writeHead(200, { 'content-type': 'text/html', 'content-length': '100000' })
      res.write('<html>partial')
      setTimeout(() => req.socket.destroy(), 50)
      return
    }
    if (req.url.startsWith('/kcp-webhook/')) {
      res.writeHead(302, { location: 'https://merchant.example/success?x=1&y=%ED%95%9C', 'set-cookie': 'up=1', 'x-upstream': 'yes' })
      res.end()
      return
    }
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ echo: Buffer.concat(chunks).toString('utf8') }))
  })
}

// Boots server.js with `env` from a directory without a .env file, so the
// developer's own .env never leaks into the test.
async function startProxy(env) {
  const port = await freePort()
  const child = spawn(process.execPath, [SERVER], {
    cwd: os.tmpdir(),
    env: { PATH: process.env.PATH, SDK_MAIN_JS: '/v1.10/main.js', PORT: String(port), ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const proxy = { child, port, base: `http://127.0.0.1:${port}`, log: '' }
  child.stdout.on('data', (d) => (proxy.log += d))
  child.stderr.on('data', (d) => (proxy.log += d))
  proxy.exited = new Promise((resolve) => child.on('exit', (code) => resolve(code)))
  for (let i = 0; i < 100 && !proxy.log.includes('Listening on') && child.exitCode === null; i++) {
    await new Promise((r) => setTimeout(r, 50))
  }
  return proxy
}

// Raw request: `p` is sent as-is so dot segments are not normalized client-side.
function request(base, method, p, headers = {}, body) {
  const u = new URL(base)
  return new Promise((resolve, reject) => {
    const r = http.request({ host: u.hostname, port: u.port, path: p, method, headers }, (res) => {
      const c = []
      res.on('data', (d) => c.push(d))
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c) }))
    })
    r.on('error', reject)
    if (body) r.write(body)
    r.end()
  })
}

let proxy

before(async () => {
  upstream = http.createServer(fakeUpstream)
  await new Promise((r) => upstream.listen(0, '127.0.0.1', r))
  upstreamUrl = `http://127.0.0.1:${upstream.address().port}`
  proxy = await startProxy({ BACKEND_URL: upstreamUrl, WEBHOOKS_UPSTREAM: upstreamUrl, SDK_UPSTREAM: upstreamUrl })
  assert.ok(proxy.log.includes('Listening on'), proxy.log)
})

after(() => {
  proxy?.child.kill()
  upstream?.close()
})

test('webhook POST: EUC-KR body, path, query and content-type reach the upstream unchanged', async () => {
  // EUC-KR "한글" plus raw `+` and `%2B`.
  const form = Buffer.concat([
    Buffer.from('res_cd=0000&res_msg='),
    Buffer.from([0xc7, 0xd1, 0xb1, 0xdb]),
    Buffer.from('&batch_key=a%2Bb+c&ordr_idxx=ORD-1'),
  ])
  const contentType = 'application/x-www-form-urlencoded; charset=euc-kr'
  await request(proxy.base, 'POST', '/kcp-webhook/v1/enrollments/confirmations?foo=bar', { 'content-type': contentType, 'content-length': form.length }, form)
  const got = seen.at(-1)
  assert.strictEqual(got.method, 'POST')
  assert.strictEqual(got.url, '/kcp-webhook/v1/enrollments/confirmations?foo=bar')
  assert.ok(got.body.equals(form), `${got.body.toString('hex')} != ${form.toString('hex')}`)
  assert.strictEqual(got.headers['content-type'], contentType)
  assert.strictEqual(got.headers.host, new URL(upstreamUrl).host)
})

test('webhook: upstream 302 and Location go back unchanged, redirect not followed, set-cookie dropped', async () => {
  const before = seen.length
  const res = await request(proxy.base, 'POST', '/kcp-webhook/v1/enrollments/failures', { 'content-type': 'application/x-www-form-urlencoded' }, 'a=1')
  assert.strictEqual(res.status, 302)
  assert.strictEqual(res.headers.location, 'https://merchant.example/success?x=1&y=%ED%95%9C')
  assert.strictEqual(res.headers['x-upstream'], 'yes')
  assert.strictEqual(res.headers['x-white-label-proxy'], 'webhooks')
  assert.strictEqual(res.headers['set-cookie'], undefined)
  assert.strictEqual(seen.length, before + 1)
})

test('webhook: browser cookies are not forwarded', async () => {
  await request(proxy.base, 'POST', '/kcp-webhook/v1/enrollments/confirmations', { cookie: 'wos-session=secret; spage=https://x' }, 'a=1')
  assert.strictEqual(seen.at(-1).headers.cookie, undefined)
})

test('webhook: client-sent x-forwarded-* / forwarded are replaced, not appended', async () => {
  await request(proxy.base, 'POST', '/kcp-webhook/v1/enrollments/confirmations', {
    'x-forwarded-for': '1.2.3.4',
    'x-forwarded-host': 'evil.example',
    'x-forwarded-proto': 'https',
    'x-forwarded-port': '1',
    forwarded: 'for=1.2.3.4;host=evil.example',
  }, 'a=1')
  const h = seen.at(-1).headers
  assert.match(h['x-forwarded-for'], /^(::ffff:)?127\.0\.0\.1$/)
  assert.strictEqual(h['x-forwarded-host'], `127.0.0.1:${proxy.port}`)
  assert.strictEqual(h['x-forwarded-proto'], 'http')
  assert.strictEqual(h['x-forwarded-port'], String(proxy.port))
  assert.strictEqual(h.forwarded, undefined)
})

test('webhook: upstream dropping the connection mid-body closes the browser response and is logged', async () => {
  const u = new URL(proxy.base)
  const outcome = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve('hung'), 3000)
    const r = http.request({ host: u.hostname, port: u.port, path: '/kcp-webhook/truncated', method: 'GET' }, (res) => {
      res.on('data', () => {})
      res.on('end', () => { clearTimeout(timer); resolve('ended') })
      res.on('aborted', () => { clearTimeout(timer); resolve('closed') })
      res.on('error', () => { clearTimeout(timer); resolve('closed') })
    })
    r.on('error', () => { clearTimeout(timer); resolve('closed') })
    r.end()
  })
  assert.strictEqual(outcome, 'closed')
  await new Promise((r) => setTimeout(r, 50))
  assert.match(proxy.log, /\[webhooks-proxy\] GET \/kcp-webhook\/truncated → http:\/\/127\.0\.0\.1:\d+.*/)
})

test('webhook: other *-webhook services are relayed too (generic route)', async () => {
  const res = await request(proxy.base, 'GET', '/paypal-webhook/v1/ping')
  assert.strictEqual(seen.at(-1).url, '/paypal-webhook/v1/ping')
  assert.strictEqual(res.headers['x-white-label-proxy'], 'webhooks')
})

test('webhook: near-miss paths are not relayed', async () => {
  assert.strictEqual((await request(proxy.base, 'POST', '/webhook/x', {}, 'a=1')).status, 404)
  assert.strictEqual((await request(proxy.base, 'POST', '/kcp-webhookx/v1', {}, 'a=1')).status, 404)
})

test('dot segments answer 400 (raw, encoded, backslash)', async () => {
  for (const p of ['/kcp-webhook/../v1/x', '/kcp-webhook/%2e%2e/v1/x', '/kcp-webhook/..%2fv1', '/kcp-webhook/..\\v1']) {
    assert.strictEqual((await request(proxy.base, 'POST', p, {}, '')).status, 400, p)
  }
})

test('/v1/* still goes through the JSON forwarder without cookies', async () => {
  const res = await request(proxy.base, 'POST', '/v1/checkout/sessions', { 'content-type': 'application/json', cookie: 'a=b' }, JSON.stringify({ a: 1 }))
  assert.strictEqual(res.headers['x-white-label-proxy'], 'backend')
  assert.strictEqual(seen.at(-1).body.toString(), '{"a":1}')
  assert.strictEqual(seen.at(-1).headers.cookie, undefined)
})

test('webhook: unreachable upstream answers 502 JSON without echoing the upstream host', async () => {
  const deadPort = await freePort()
  const dead = await startProxy({ WEBHOOKS_UPSTREAM: `http://127.0.0.1:${deadPort}` })
  try {
    const res = await request(dead.base, 'POST', '/kcp-webhook/v1/enrollments/confirmations', {}, 'a=1')
    assert.strictEqual(res.status, 502)
    assert.strictEqual(JSON.parse(res.body).error, 'upstream_unreachable')
    assert.ok(!res.body.toString().includes(String(deadPort)), res.body.toString())
    assert.match(dead.log, /\[webhooks-proxy\] POST \/kcp-webhook\/v1\/enrollments\/confirmations →/)
  } finally {
    dead.child.kill()
  }
})

test('webhook: WEBHOOKS_UPSTREAM unset answers 404 JSON', async () => {
  const off = await startProxy({ WEBHOOKS_UPSTREAM: '' })
  try {
    const res = await request(off.base, 'POST', '/kcp-webhook/v1/enrollments/confirmations', {}, 'a=1')
    assert.strictEqual(res.status, 404)
    assert.strictEqual(JSON.parse(res.body).error, 'webhooks_upstream_not_configured')
  } finally {
    off.child.kill()
  }
})

test('TLS: unreadable TLS_CERT exits 1 with a message naming the variable, no stack', async () => {
  const bad = await startProxy({ TLS_CERT: '/nonexistent/cert.pem', TLS_KEY: '/nonexistent/key.pem' })
  const code = await bad.exited
  assert.strictEqual(code, 1)
  assert.match(bad.log, /\[tls\] cannot read TLS_CERT: ENOENT/)
  assert.doesNotMatch(bad.log, /\n\s+at /)
})
