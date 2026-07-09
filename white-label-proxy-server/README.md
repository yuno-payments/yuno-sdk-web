# white-label-proxy-server

Local test harness for Yuno's white-label hosting. It emulates a merchant's own origin/sub-path in front of the
Yuno checkout stack, so both white-label surfaces can be exercised end-to-end from a **non-Yuno origin**
(`localhost:9090`):

1. **Payment Link white-label checkout ([CORECM-18149](https://yuno.atlassian.net/browse/CORECM-18149)).** The
   `sdk-checkout` React app (normally `checkout.<env>.y.uno`) is served through this proxy so a merchant can map
   `checkout.y.uno/payment?session=…` onto `their.host/<base-path>/payment?session=…`. The proxy serves the SPA
   routes (`/payment`, `/payment/status`, `/enroll`), rewrites the CRA bundle origin back to itself, and forwards
   the checkout BFF (`/checkout-bff/*`) and notification WebSocket upstream.
2. **SDK white-label rename ([sdk-web PR #2086](https://github.com/yuno-payments/sdk-web/pull/2086)).**
   `window.SdkPayments`, `sdk-payments-ready` event, no `yuno-*` DOM tokens leaked to the merchant page. Partner
   test pages point their `<script src>` at this origin so the SDK loads from `localhost:9090` (no `*.y.uno`
   hostname).

The server hosts a minimal landing page and transparently proxies all checkout, SDK asset, API, and WebSocket
traffic upstream, which is what exercises the white-label code paths end-to-end.

## What it does

| Request                                                | Routed to                              |
| ------------------------------------------------------ | -------------------------------------- |
| `/`                                                    | Landing page (`pages/index.html`)      |
| `/static/*` (proxy's own page assets)                  | Local assets (`static/*`)              |
| `/whitelabel-info`                                     | JSON describing current upstream config |
| `/payment`, `/payment/status`, `/enroll`               | `CHECKOUT_UPSTREAM` index.html (SPA)   |
| `/static/(js\|css\|media)/*`, `/favicon.ico`, `/manifest.json`, `/robots.txt`, `/asset-manifest.json` | `CHECKOUT_UPSTREAM` (checkout CRA bundle) |
| `/checkout-bff/*` (HTTP)                               | `CHECKOUT_BFF_UPSTREAM`                |
| `/checkout-websocket-notification-ms/ws/{payment,enrollment}` (WS) | `BACKEND_WS_URL`          |
| `/v1/*`, `/v2/*` (HTTP + WS)                           | `BACKEND_URL` / `BACKEND_WS_URL`       |
| `/challenge.html`, `/redirect.html`, `/session-id.html`, `/assets/(challenge\|redirect\|session-id\|validate-url)*` | `SDK_3DS_UPSTREAM` |
| `/v<semver>/pages/*`, `/v<semver>/assets/*`            | `SDK_CARD_UPSTREAM`                    |
| `/icons/*`, `/css/*`, `/brands/*`, `/c2p/*`            | `SDK_STATIC_UPSTREAM` (`sdk.prod.y.uno`)  |
| `/sdk-web/*`, `/flags/*`, bare brand images (`/Visa.png`, …) | `SDK_ICONS_UPSTREAM` (`icons.prod.y.uno`) |
| Everything else (GET/HEAD)                             | `SDK_UPSTREAM`                         |

> **Checkout CRA bundle vs. SDK bare images:** the checkout app's `/static/(js|css|media)/*` and root public
> files (`/favicon.ico`, `/manifest.json`, …) are matched **before** the SDK icon rules so they route to
> `CHECKOUT_UPSTREAM` and don't fall through to `icons.prod.y.uno`.

> **Static assets (CORECM-17664):** the SDK used to load icons/logos/fonts directly from `icons.prod.y.uno` /
> `sdk.prod.y.uno`, bypassing the white-label host. It now host-swaps them to this proxy (path preserved), so the
> proxy forwards them by path prefix to the two asset CDNs. Requires an SDK build that includes the fix
> (sdk-web + `@yuno/sdk-web-core` ≥ 7.5.0) and a partner page that inits with `{ apiUrl: '<this proxy origin>' }`.

### Payment Link checkout white-label (CORECM-18149)

A merchant white-labels the hosted checkout by mapping `checkout.<env>.y.uno/payment?session=…` onto their own
`host/<BASE_PATH>/payment?session=…`. Emulate it locally with `CHECKOUT_UPSTREAM` (the `sdk-checkout` app shell)
and `CHECKOUT_BFF_UPSTREAM` (the BFF it calls):

- **SPA routes** (`/payment`, `/payment/status`, `/enroll`) fetch `CHECKOUT_UPSTREAM/index.html`; the proxy
  rewrites the absolute `PUBLIC_URL` origin (`checkout.<env>.y.uno`) to `BASE_PATH` so the CRA bundle, favicon
  and manifest load back through this proxy instead of leaking to the Yuno host. react-router resolves the actual
  route client-side from `window.location`.
- **BFF calls** — the checkout app's axios `baseURL` is the white-labeled `apiUrl`
  (`host/<BASE_PATH>/checkout-bff/v1`). After the `BASE_PATH` strip the proxy sees `/checkout-bff/*` and forwards
  it to `CHECKOUT_BFF_UPSTREAM` (`GET /checkout-bff/v1/checkout-info/{session}`,
  `POST /checkout-bff/v1/checkout/payment`).
- **Payment/enrollment status WebSocket** — `/checkout-websocket-notification-ms/ws/{payment,enrollment}` is
  forwarded to `BACKEND_WS_URL`.

The allowlist that gates `apiUrl`/`assetUrl` (`REACT_APP_WHITE_LABEL_ALLOWED_HOSTS`) lives in `sdk-checkout`;
add `localhost` to the dev env there to test through this proxy. See `sdk-checkout/CLAUDE.md` and its `README.md`
for the app-side wiring.

To try it: point a browser at `http://localhost:9090<BASE_PATH>/payment?session=<checkout-session>` with a
matching `CHECKOUT_UPSTREAM`/`CHECKOUT_BFF_UPSTREAM` env for the session's environment.

### Sub-path mounting (`BASE_PATH`)

A partner gateway is often **mounted under a sub-path** rather than at the origin root — e.g. Zuora serves the
SDK from `https://host/hosted-payment-methods/hosted-payment-form/orchestrator`. Since CORECM-17664 the SDK
preserves that prefix on **every** asset/API/WS request (it carries `apiUrl`/`assetUrl`), so the proxy must strip
it before routing.

Set `BASE_PATH` to emulate this. The proxy strips it from every incoming request (local routes, `/v1`–`/v2`
backend, the asset catch-all, and WebSocket upgrades) so the existing root-level routing matches. Empty = root
mount (default, unchanged). When set, the partner page must:

- load the SDK from `http://localhost:9090<BASE_PATH>/v<ver>/main.js`, and
- initialize with `apiUrl`/`assetUrl` = `http://localhost:9090<BASE_PATH>`.

```bash
BASE_PATH=/hosted-payment-methods/hosted-payment-form/orchestrator
# icon → http://localhost:9090/hosted-payment-methods/.../orchestrator/sdk-web/foo.svg
#      → strip BASE_PATH → /sdk-web/foo.svg → SDK_ICONS_UPSTREAM
```

> **Versioned `assetUrl`:** you can pin a bundle version on `assetUrl`
> (`…/orchestrator/v1.0`). The SDK uses that path for the JS chunks but **strips the trailing `/v<semver>`** when
> resolving host-swapped CDN assets (icons/fonts aren't versioned), so both `assetUrl = …/orchestrator` and
> `assetUrl = …/orchestrator/v1.0` route icons correctly. Needs `@yuno/sdk-web-core` ≥ 7.5.0.

Additional behaviour worth knowing:

- The injected `main.js` path is resolved at boot from `<SDK_UPSTREAM>/versions.json` (`latest.version`).
  Override with `SDK_MAIN_JS=/v1.7/main.js` in `.env`.
- Partners can reference any version (e.g. `/v1.100/main.js`); requests are normalized to the version the
  upstream actually publishes.
- Permissive CORS — caller origin is echoed back, upstream CORS headers are stripped so they can't override.

## Setup

```bash
cp .env.example .env       # then edit upstream URLs if needed
npm install
npm start                  # listens on :9090
```

For the default backend (`BACKEND_URL=http://localhost:8080`), also run the root server so `/v1/*` and `/v2/*`
calls succeed:

```bash
cd .. && npm run start:dev
```

Then open http://localhost:9090/ for the landing page (shows current proxy config). Two ways to exercise it:

- **Payment Link checkout:** open `http://localhost:9090<BASE_PATH>/payment?session=<checkout-session>` with
  `CHECKOUT_UPSTREAM`/`CHECKOUT_BFF_UPSTREAM` set to the session's environment. The checkout SPA renders under the
  non-Yuno origin and calls the BFF back through the proxy.
- **SDK:** point your own partner test pages at `http://localhost:9090` — e.g. load the SDK via
  `<script src="http://localhost:9090/v1.7/main.js">` — and the proxy fetches it from `SDK_UPSTREAM` on your
  behalf so the SDK runs against a non-Yuno origin.

## Environment variables

Copy `.env.example` to `.env` and adjust. Yuno hostnames follow two conventions:

- **SDK services** use `<service>[.<env>].y.uno` — e.g. `sdk-web.y.uno`, `sdk-web.staging.y.uno`, `sdk-web.dev.y.uno`.
- **API surface** uses an `api[-<env>].y.uno` prefix — e.g. `api.y.uno`, `api-staging.y.uno`, `api-dev.y.uno`.
- **WebSocket service** has NO `api-` prefix — it's `<env>.y.uno` directly (`y.uno`, `staging.y.uno`, `dev.y.uno`).

| Var                  | Purpose                                       | Production                       | Staging                                  | Dev                                  |
| -------------------- | --------------------------------------------- | -------------------------------- | ---------------------------------------- | ------------------------------------ |
| `PORT`               | Proxy listen port                             | `9090`                           | `9090`                                   | `9090`                               |
| `BASE_PATH`          | Sub-path the proxy is mounted under (stripped before routing); empty = root | _(empty)_ | _(empty)_ | `/hosted-payment-methods/.../orchestrator` |
| `CHECKOUT_UPSTREAM`  | sdk-checkout app shell (`/payment`, `/enroll`, CRA bundle) | `https://checkout.y.uno` | `https://checkout.staging.y.uno`         | `https://checkout.dev.y.uno`         |
| `CHECKOUT_BFF_UPSTREAM` | Checkout BFF (`/checkout-bff/*`); NO `api-` prefix      | `https://prod.y.uno`    | `https://staging.y.uno`                  | `https://dev.y.uno`                  |
| `SDK_UPSTREAM`       | Main SDK bundle                               | `https://sdk-web.y.uno`          | `https://sdk-web.staging.y.uno`          | `https://sdk-web.dev.y.uno`          |
| `SDK_CARD_UPSTREAM`  | Card-form / secure-fields micro-app           | `https://sdk-web-card.y.uno`     | `https://sdk-web-card.staging.y.uno`     | `https://sdk-web-card.dev.y.uno`     |
| `SDK_3DS_UPSTREAM`   | 3DS challenge / redirect / session-id pages   | `https://sdk-3ds.y.uno`          | `https://sdk-3ds.staging.y.uno`          | `https://sdk-3ds.dev.y.uno`          |
| `SDK_STATIC_UPSTREAM`| Static assets (`/icons`, `/css`, `/brands`, `/c2p`) | `https://sdk.prod.y.uno`   | `https://sdk.prod.y.uno`                 | `https://sdk.prod.y.uno`             |
| `SDK_ICONS_UPSTREAM` | Icon assets (`/sdk-web`, `/flags`, `/*.png`)  | `https://icons.prod.y.uno`       | `https://icons.prod.y.uno`               | `https://icons.prod.y.uno`           |
| `BACKEND_URL`        | SDK API (`/v1/*`, `/v2/*`)                    | `https://api.y.uno`              | `https://api-staging.y.uno`              | `https://api-dev.y.uno`              |
| `BACKEND_WS_URL`     | WebSocket upgrades                            | `https://y.uno`                  | `https://staging.y.uno`                  | `https://dev.y.uno`                  |
| `SDK_MAIN_JS`        | Pin a specific SDK version                    | `/v1.7.4/main.js`                | `/v1.7.4/main.js`                        | `/v1.7.4/main.js`                    |

Defaults:

- `SDK_CARD_UPSTREAM`, `SDK_3DS_UPSTREAM`, `BACKEND_WS_URL` fall back to `SDK_UPSTREAM` / `BACKEND_URL` when unset.
- `CHECKOUT_UPSTREAM` and `CHECKOUT_BFF_UPSTREAM` default to sandbox (`https://checkout.sandbox.y.uno`,
  `https://sandbox.y.uno`) — set both to the environment matching your checkout session.
- `SDK_MAIN_JS` is auto-resolved from `<SDK_UPSTREAM>/versions.json` (`latest.version`), falling back to `/v1.7/main.js`.
- `BACKEND_URL` can also point at a local backend (`http://localhost:8080`) — run `cd .. && npm run start:dev`.

## Layout

```
white-label-proxy-server/
├── server.js              # Express + http-proxy server (single file)
├── pages/                 # Landing page (index.html)
├── static/                # Page JS/CSS (api.js, styles.css)
├── .env.example
└── package.json
```
