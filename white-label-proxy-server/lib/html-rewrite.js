'use strict'

// Absolute Yuno origins that must never reach the merchant's browser. A
// white-labeled page has to render every URL on the partner host, so any
// `*.y.uno` (or bare `y.uno`) origin embedded in upstream HTML is stripped to
// a root-relative path and re-anchored under BASE_PATH below.
const YUNO_ORIGIN_RE = /https?:\/\/(?:[a-z0-9-]+\.)*y\.uno(?::\d+)?(?![a-z0-9.-])/gi

// Root-absolute URLs in markup attributes (src/href/action) and in the
// import-map / modulepreload style attributes Vite emits. Under a sub-path
// mount these must carry BASE_PATH or the browser resolves them against the
// partner origin root and 404s.
const ROOT_ABSOLUTE_ATTR_RE = /((?:src|href|action)\s*=\s*["'])\/(?!\/)/gi

const HTML_CONTENT_TYPE_RE = /^\s*text\/html\b/i

function isHtmlContentType(contentType) {
  return HTML_CONTENT_TYPE_RE.test(contentType || '')
}

// Builds the rewriter used for every HTML document this proxy serves
// (checkout SPA shell, 3DS challenge/redirect/session-id pages).
function createHtmlRewriter(basePath) {
  const prefix = String(basePath || '').replace(/\/+$/, '')

  return function rewriteHtml(html) {
    if (typeof html !== 'string') return html
    const sameOrigin = html.replace(YUNO_ORIGIN_RE, '')
    if (!prefix) return sameOrigin
    return sameOrigin.replace(ROOT_ABSOLUTE_ATTR_RE, (_match, attr) => `${attr}${prefix}/`)
  }
}

// Diagnostic helper: the absolute Yuno URLs still present in a document.
// Used by the proxy to log a white-label leak instead of failing silently.
function findYunoUrls(html) {
  if (typeof html !== 'string') return []
  return html.match(YUNO_ORIGIN_RE) || []
}

module.exports = {
  createHtmlRewriter,
  findYunoUrls,
  isHtmlContentType,
  YUNO_ORIGIN_RE,
}
