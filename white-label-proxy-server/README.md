# white-label-proxy-server

Test harness for [sdk-web PR #2086](https://github.com/yuno-payments/sdk-web/pull/2086) — the white-label rename
(`window.SdkPayments`, `sdk-payments-ready` event, no `yuno-*` DOM tokens leaked to the merchant page).

The server hosts a minimal landing page on a **non-Yuno origin** (`localhost:9090`) and transparently proxies all
SDK asset, API, and WebSocket traffic upstream. Partner test pages — your own or another subproject — point their
`<script src>` at this origin so the SDK loads from `localhost:9090` (no `*.y.uno` hostname), which is what
exercises the white-label code paths end-to-end.

## What it does

| Request                                                | Routed to                              |
| ------------------------------------------------------ | -------------------------------------- |
| `/`                                                    | Landing page (`pages/index.html`)      |
| `/static/*`                                            | Local assets (`static/*`)              |
| `/whitelabel-info`                                     | JSON describing current upstream config |
| `/v1/*`, `/v2/*` (HTTP + WS)                           | `BACKEND_URL` / `BACKEND_WS_URL`       |
| `/challenge.html`, `/redirect.html`, `/session-id.html`, `/assets/(challenge\|redirect\|session-id\|validate-url)*` | `SDK_3DS_UPSTREAM` |
| `/v<semver>/pages/*`, `/v<semver>/assets/*`            | `SDK_CARD_UPSTREAM`                    |
| `/icons/*`, `/css/*`, `/brands/*`, `/c2p/*`            | `SDK_STATIC_UPSTREAM` (`sdk.prod.y.uno`)  |
| `/sdk-web/*`, `/flags/*`, bare brand images (`/Visa.png`, …) | `SDK_ICONS_UPSTREAM` (`icons.prod.y.uno`) |
| Everything else (GET/HEAD)                             | `SDK_UPSTREAM`                         |

> **Static assets (CORECM-17664):** the SDK used to load icons/logos/fonts directly from `icons.prod.y.uno` /
> `sdk.prod.y.uno`, bypassing the white-label host. It now host-swaps them to this proxy (path preserved), so the
> proxy forwards them by path prefix to the two asset CDNs. Requires an SDK build that includes the fix
> (sdk-web + `@yuno/sdk-web-core` ≥ 7.5.0) and a partner page that inits with `{ apiUrl: '<this proxy origin>' }`.

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

Then open http://localhost:9090/ for the landing page (shows current proxy config). Point your own
partner test pages at `http://localhost:9090` — e.g. load the SDK via
`<script src="http://localhost:9090/v1.7/main.js">` — and the proxy will fetch it from `SDK_UPSTREAM`
on your behalf so the SDK runs against a non-Yuno origin.

## Environment variables

Copy `.env.example` to `.env` and adjust. Yuno hostnames follow two conventions:

- **SDK services** use `<service>[.<env>].y.uno` — e.g. `sdk-web.y.uno`, `sdk-web.staging.y.uno`, `sdk-web.dev.y.uno`.
- **API surface** uses an `api[-<env>].y.uno` prefix — e.g. `api.y.uno`, `api-staging.y.uno`, `api-dev.y.uno`.
- **WebSocket service** has NO `api-` prefix — it's `<env>.y.uno` directly (`y.uno`, `staging.y.uno`, `dev.y.uno`).

| Var                  | Purpose                                       | Production                       | Staging                                  | Dev                                  |
| -------------------- | --------------------------------------------- | -------------------------------- | ---------------------------------------- | ------------------------------------ |
| `PORT`               | Proxy listen port                             | `9090`                           | `9090`                                   | `9090`                               |
| `BASE_PATH`          | Sub-path the proxy is mounted under (stripped before routing); empty = root | _(empty)_ | _(empty)_ | `/hosted-payment-methods/.../orchestrator` |
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
