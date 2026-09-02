'use strict'

const http = require('http')
const path = require('path')
const { spawn } = require('child_process')

const SERVER_ENTRY = path.join(__dirname, '..', 'server.js')

// Starts a stub upstream. `routes` maps a pathname to
// { body, contentType, status }. Unknown paths answer 404 so the proxy's
// "fall through on 404" behaviour stays exercised.
async function startStubUpstream(routes, label) {
  const requests = []
  const server = http.createServer((req, res) => {
    const pathname = req.url.split('?')[0]
    requests.push(req.url)
    const route = routes[pathname]
    if (!route) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
      return
    }
    res.writeHead(route.status || 200, { 'content-type': route.contentType || 'text/plain' })
    res.end(route.body)
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()

  return {
    label,
    port,
    origin: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

async function findFreePort() {
  const probe = http.createServer()
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve))
  const { port } = probe.address()
  await new Promise((resolve) => probe.close(resolve))
  return port
}

// Boots the real server.js as a child process so tests exercise the actual
// runtime wiring (route order, middleware, env resolution) rather than a
// re-implementation of it.
async function startProxy(env) {
  const port = await findFreePort()
  const child = spawn(process.execPath, [SERVER_ENTRY], {
    env: {
      ...process.env,
      ...env,
      PORT: String(port),
      // Keep the boot deterministic: never reach the network for versions.json.
      SDK_MAIN_JS: env.SDK_MAIN_JS || '/v1.10/main.js',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const output = []
  child.stdout.on('data', (chunk) => output.push(String(chunk)))
  child.stderr.on('data', (chunk) => output.push(String(chunk)))

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`proxy did not start:\n${output.join('')}`)), 15000)
    const check = () => {
      if (output.join('').includes('Listening on')) {
        clearTimeout(timer)
        resolve()
        return
      }
      setTimeout(check, 50)
    }
    child.on('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`proxy exited early (${code}):\n${output.join('')}`))
    })
    check()
  })

  return {
    origin: `http://127.0.0.1:${port}`,
    output,
    get logs() {
      return output.join('')
    },
    close: () =>
      new Promise((resolve) => {
        child.on('exit', resolve)
        child.kill('SIGKILL')
      }),
  }
}

module.exports = { startStubUpstream, startProxy }
