// All requests go through the white-label proxy (this same origin), which
// forwards them to the backend server on port 8080. The browser never talks
// to a *.y.uno host directly — that is the whole point of the white-label
// setup.

export async function getProxyInfo() {
  return fetch('/whitelabel-info').then((r) => r.json())
}
