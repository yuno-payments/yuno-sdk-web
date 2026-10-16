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

0. **`BASE_PATH` strip** (only when set), then a guard that rejects `.` / `..` path segments with 400 (they
   would escape a prefix rule once the upstream URL is resolved): a top middleware that strips the configured sub-path from
   `req.url`/`req.originalUrl` so every downstream match and forward sees root-relative paths. Emulates a partner
   gateway mounted under a sub-path (e.g. `…/orchestrator`); the SDK preserves that prefix on all asset/API/WS
   requests since CORECM-17664. Empty = root mount. Applied to WS upgrades too. The injected `__SDK_MAIN_JS__` is
   prefixed with `BASE_PATH`.
1. **Provider webhooks** (`/<name>-webhook/*`, any method) → `WEBHOOKS_UPSTREAM` via a dedicated `http-proxy`
   instance (`webhooksProxy`). **Generic on purpose:** `WEBHOOK_RE` makes this host a relay to every Yuno
   `*-webhook` service of the environment (`/kcp-webhook/*`, `/paypal-webhook/*`, `/stripe-webhook/*`, …), so a
   new browser-posted provider flow needs no proxy change. Merchant gateways only need the exact paths the README
   lists per provider (KCP: `POST /kcp-webhook/v1/enrollments/{confirmations,failures}`). Registered BEFORE
   `express.json()` and the CORS middleware on purpose: the body is streamed raw (KCP posts
   `x-www-form-urlencoded`, maybe `euc-kr`), every method incl. `OPTIONS` reaches upstream, and redirects are NOT
   followed (the 302 + `Location` to the merchant success/error URL must reach the browser). Strips `cookie` and
   client-sent `x-forwarded-*` / `forwarded` (`stripForwardedHeaders`) so `xfwd` sets fresh ones from the
   connection, drops hop-by-hop and `set-cookie` response headers, sets `x-white-label-proxy: webhooks`. Upstream
   unreachable → 502 `{"error":"upstream_unreachable"}` (no upstream URL in the body); upstream closing mid-body
   (headers already sent) → the `proxyRes` `close` handler logs it and destroys the browser response.
   `WEBHOOKS_UPSTREAM` unset → 404 JSON.
1b. JSON body parser + permissive CORS middleware (echoes caller origin, strips upstream CORS).
2. Local routes: `/` (landing), `/static/*`, `/whitelabel-info`.
3. **Backend pass-through**: `app.all('/v1/*' | '/v2/*', forwardToBackend)` → `BACKEND_URL`, and
   `app.all('/checkout-bff/*', forwardToCheckoutBff)` → `CHECKOUT_BFF_UPSTREAM`. Both share `forwardHttp`
   (node-fetch, re-serializes the body since `express.json()` consumed it, strips `cookie`).
   The checkout BFF is what the sdk-checkout app hits via its white-labeled `apiUrl`
   (`host/<BASE_PATH>/checkout-bff/v1/{checkout-info/{session},checkout/payment}`).
4. **Checkout SPA routes** (GET, before the SDK catch-all): `app.get(CHECKOUT_ROUTE_RE, proxyCheckoutHtml)`
   for `/payment`, `/payment/status`, `/enroll` → fetches `CHECKOUT_UPSTREAM/index.html` and rewrites the
   absolute `PUBLIC_URL` origin (`checkout.<env>.y.uno`) to `BASE_PATH` so the bundle/favicon/manifest load
   back through this proxy instead of leaking to the Yuno host. react-router resolves the actual route
   client-side from `window.location`.
5. **SDK/asset upstream catch-all** (GET/HEAD): `proxyToUpstream` picks one upstream via `pickSdkUpstream`:
   - `CHECKOUT_UPSTREAM` for the checkout CRA bundle (`/static/(js|css|media)/*`) and root public files
     (`/favicon.ico`, `/manifest.json`, `/robots.txt`, `/asset-manifest.json`) — checked first so they don't
     fall through to the SDK icon upstream.
   - `SDK_3DS_UPSTREAM` for `/challenge.html`, `/redirect.html`, `/session-id.html`, and
     `/assets/(challenge|redirect|session-id|validate-url)*`.
   - `SDK_CARD_UPSTREAM` for `/v<semver>/pages/*` and `/v<semver>/assets/*`.
   - `SDK_STATIC_BUNDLES_UPSTREAM` (`prod.y.uno`) for `/sdk-static-bundles-ms/*`: the font stylesheet the SDK
     loads since 1.10.9, the woff2 files it references with relative `../fonts/` URLs, the Forter script and the
     Riskified SRI beacon. Checked before the static rule below.
   - `SDK_STATIC_UPSTREAM` for `/icons/*`, `/css/*`, `/brands/*`, `/c2p/*`, `/wallets/*` (Samsung Pay PT button) and
     `/fonts/*` (Checkout Builder custom fonts).
   - `SDK_ICONS_UPSTREAM` for `/sdk-web/*`, `/flags/*`, and bare root brand images (`/Visa.png`, …).
   - `SDK_UPSTREAM` otherwise.
   For the main SDK upstream, the version segment is normalized to whatever `versions.json` says is `latest`,
   so partners can request any `/v<x>/main.js` and still hit the published build.
6. 404 fallback. Upstream 404s are logged with the route label and upstream, so a path without a rule of its
   own shows up in the console instead of failing silently.
7. WebSocket upgrades on the underlying server (Express middleware never sees `Upgrade`). The server is
   `https.Server` when both `TLS_CERT` and `TLS_KEY` are set, `http.Server` otherwise (`createServer()`); the
   upgrade handler is attached to whichever one is used. An unreadable cert/key file exits 1 with
   `[tls] cannot read TLS_CERT|TLS_KEY: <message>` (`readTlsFile`).
   Uses `http-proxy`. `/checkout-websocket-notification-ms/ws/{payment,enrollment}` → `BACKEND_WS_URL`;
   everything else follows the same SDK/card/3DS split as HTTP.

The injected `main.js` path is resolved once at boot:
- If `process.env.SDK_MAIN_JS` is set, use it.
- Else fetch `<SDK_UPSTREAM>/versions.json` and use `latest.version` (`/v<x.y.z>/main.js`).
- Else fall back to `/v1.10/main.js`.

Template tag `__SDK_MAIN_JS__` in `pages/index.html` is replaced server-side per request, in case a future
landing page wants to embed the resolved main.js path. There are no checkout test pages here anymore — point
your own partner pages (or another subproject in this repo) at `http://localhost:9090` to exercise the SDK
against a non-Yuno origin.

## Running

```bash
cp .env.example .env
npm install
npm start    # → http://localhost:9090
npm test     # smoke tests (node --test, see below)
```

`BACKEND_URL` defaults to `http://localhost:8080`, so for the default config also run the root server
(`cd .. && npm run start:dev`) so `/v1/*` and `/v2/*` succeed.

## Things to watch when editing

- **Never move the webhooks route after `express.json()`.** It would consume JSON bodies and the raw form
  forwarding relies on the untouched request stream.
- **Route order matters.** The SDK upstream catch-all is `app.use((req, res, next) => ...)` registered last;
  anything you add after it will be unreachable unless you guard the catch-all.
- **CORS headers must come from this server, not upstream.** The permissive CORS middleware (registered right
  after `express.json()`) is what makes credentialed cross-origin requests work from the merchant page.
  `forwardHttp` strips `access-control-*` from upstream responses for the same reason — don't pass them through.
  Exception: the webhooks route is a transparent forwarder for top-level navigations and passes upstream
  headers as-is (minus hop-by-hop and `set-cookie`).
- **`BASE_PATH` handling** lives in `underBasePath` / `stripBasePath` (HTTP middleware and the WS `upgrade`
  handler); the `.`/`..` guard is `hasDotSegment`. Keep both ahead of every route.
- **`HOP_BY_HOP` headers** are filtered both ways (`pickRequestHeaders`, `forwardHttp`, the `webhooksProxy`
  `proxyRes` hook). The set is declared above the webhooks block because that hook uses it. Don't add
  `content-length` to a manual copy without re-stripping it — node-fetch sets it itself.
- **The version normalizer** only touches `SDK_UPSTREAM` paths. Card and 3DS upstreams handle their own
  versioning (or don't version at all). If you broaden it, make sure card paths still resolve.
- **WebSocket auth** is whatever `http-proxy` sees in the upstream-bound request headers. Do not strip
  `cookie` or `authorization` from WS upgrades.
- **`.env` is gitignored**, `.env.example` is the source of truth for available knobs. Keep them in sync.

## Out of scope for this server

- No build step — plain Node + ES modules in the browser. Don't introduce a bundler.
- No unit tests with a mocked proxy. `test/server.test.js` (`npm test`, `node --test`, no extra dependencies) boots
  the real `server.js` as a child process, from a directory without `.env`, against a fake upstream on a free
  port, and checks what reaches the upstream and the browser: raw EUC-KR body, 302 passthrough, cookie and
  `set-cookie` strip, `x-forwarded-*` spoofing, mid-body upstream drop, `/v1` JSON forwarding, dot-segment guard,
  502/404 answers and the TLS read error. Add a case there when you change routing or header handling.
- Don't add backwards-compat shims for `window.Yuno` here — that's the SDK's responsibility (and it already
  exposes it as a legacy alias).
