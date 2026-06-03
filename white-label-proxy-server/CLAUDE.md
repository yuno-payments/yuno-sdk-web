# CLAUDE.md — white-label-proxy-server

## Purpose

A standalone Express proxy that hosts a minimal landing page on `localhost:9090` and forwards SDK assets, API
calls, and WebSocket upgrades to configurable upstreams. Partner test pages (your own or another subproject)
point their `<script src>` at this origin so the SDK runs against a non-Yuno host. Built specifically to
exercise the white-label rename in [sdk-web PR #2086](https://github.com/yuno-payments/sdk-web/pull/2086):

- `window.SdkPayments` (new) vs `window.Yuno` (legacy alias)
- `sdk-payments-ready` event vs `yuno-sdk-ready`
- No `yuno-*` / `Yuno-*` DOM tokens leaking to the merchant page

This subproject is **independent** of the rest of `yuno-sdk-web` — own `package.json`, own lockfile, own
dependencies. Do not try to share modules with the parent.

## Architecture

Single file: `server.js`. Routes are registered in this order (order matters):

1. JSON body parser + permissive CORS middleware (echoes caller origin, strips upstream CORS).
2. Local routes: `/` (landing), `/static/*`, `/whitelabel-info`.
3. **Backend pass-through**: `app.all('/v1/*' | '/v2/*', forwardToBackend)` → `BACKEND_URL`.
   Uses `node-fetch`; re-serializes the body (since `express.json()` consumed it).
4. **SDK upstream catch-all** (GET/HEAD): `proxyToUpstream` picks one upstream via `pickSdkUpstream`:
   - `SDK_3DS_UPSTREAM` for `/challenge.html`, `/redirect.html`, `/session-id.html`, and
     `/assets/(challenge|redirect|session-id|validate-url)*`.
   - `SDK_CARD_UPSTREAM` for `/v<semver>/pages/*` and `/v<semver>/assets/*`.
   - `SDK_STATIC_UPSTREAM` for `/icons/*`, `/css/*`, `/brands/*`, `/c2p/*`.
   - `SDK_ICONS_UPSTREAM` for `/sdk-web/*`, `/flags/*`, and bare root brand images (`/Visa.png`, …).
   - `SDK_UPSTREAM` otherwise.
   For the main SDK upstream, the version segment is normalized to whatever `versions.json` says is `latest`,
   so partners can request any `/v<x>/main.js` and still hit the published build.
5. 404 fallback.
6. WebSocket upgrades on the underlying `http.Server` (Express middleware never sees `Upgrade`).
   Uses `http-proxy`. `/checkout-websocket-notification-ms/ws/{payment,enrollment}` → `BACKEND_WS_URL`;
   everything else follows the same SDK/card/3DS split as HTTP.

The injected `main.js` path is resolved once at boot:
- If `process.env.SDK_MAIN_JS` is set, use it.
- Else fetch `<SDK_UPSTREAM>/versions.json` and use `latest.version` (`/v<x.y.z>/main.js`).
- Else fall back to `/v1.7/main.js`.

Template tag `__SDK_MAIN_JS__` in `pages/index.html` is replaced server-side per request, in case a future
landing page wants to embed the resolved main.js path. There are no checkout test pages here anymore — point
your own partner pages (or another subproject in this repo) at `http://localhost:9090` to exercise the SDK
against a non-Yuno origin.

## Running

```bash
cp .env.example .env
npm install
npm start    # → http://localhost:9090
```

`BACKEND_URL` defaults to `http://localhost:8080`, so for the default config also run the root server
(`cd .. && npm run start:dev`) so `/v1/*` and `/v2/*` succeed.

## Things to watch when editing

- **Route order matters.** The SDK upstream catch-all is `app.use((req, res, next) => ...)` registered last;
  anything you add after it will be unreachable unless you guard the catch-all.
- **CORS headers must come from this server, not upstream.** The middleware in `server.js:69` is what makes
  credentialed cross-origin requests work from the merchant page. The upstream proxy strips
  `access-control-*` from upstream responses (`server.js:166-170`) for the same reason — don't pass them through.
- **`HOP_BY_HOP` headers** (`server.js:130-141`) are filtered both ways. Don't add `content-length` to a manual
  copy without re-stripping it — node-fetch sets it itself.
- **The version normalizer** only touches `SDK_UPSTREAM` paths. Card and 3DS upstreams handle their own
  versioning (or don't version at all). If you broaden it, make sure card paths still resolve.
- **WebSocket auth** is whatever `http-proxy` sees in the upstream-bound request headers. Do not strip
  `cookie` or `authorization` from WS upgrades.
- **`.env` is gitignored**, `.env.example` is the source of truth for available knobs. Keep them in sync.

## Out of scope for this server

- No build step — plain Node + ES modules in the browser. Don't introduce a bundler.
- No tests yet. If you add some, they should hit real upstream HTML/JS responses (mocking the proxy defeats its
  purpose).
- Don't add backwards-compat shims for `window.Yuno` here — that's the SDK's responsibility (and it already
  exposes it as a legacy alias).
