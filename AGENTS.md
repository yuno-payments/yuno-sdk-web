# AGENTS.md — yuno-sdk-web

Public demo and integration examples for Yuno's Web SDK (`@yuno-payments/sdk-web`,
served from `https://sdk-web.y.uno/v<major.minor>/main.js`). Merchants and
partners clone it or copy snippets from it to bootstrap an integration, and the
team uses it to reproduce SDK behaviour against real sessions. The README is the
public integration guide (Seamless, Lite, Full, Secure Fields, Status,
Enrollment). Nothing here is published to npm or deployed: it changes when the
examples change.

This file is the single source of truth; `CLAUDE.md` only imports it.
`white-label-proxy-server/AGENTS.md` adds the rules of that sub-project.

## Build and run

Every directory with a `package.json` is an independent npm project with its
own lockfile. Run commands from that directory.

```bash
# Root: Express server + vanilla demo pages, http://localhost:8080
cp .env.example .env          # ACCOUNT_CODE, PUBLIC_API_KEY, PRIVATE_SECRET_KEY
npm install
npm run start:dev             # there is no `npm start` at the root

# Framework demos
cd yuno-angular && npm start                         # ng serve
cd yuno-react && npm run dev                         # vite
cd yuno-vue && npm run dev                           # vite
cd yuno-vtex-webview/HeadlessVTEXWeb && npm run dev  # vite

# White-label proxy, http://localhost:9090 (see its AGENTS.md)
cd white-label-proxy-server && npm start
```

Builds: `npm run build` in `yuno-angular`, `yuno-react` (`tsc -b && vite build`),
`yuno-vue` (`vue-tsc -b && vite build`) and `yuno-vtex-webview/HeadlessVTEXWeb`.
`yuno-vtex-webview/HeadlessVTEXAndroid` (Gradle) and `HeadlessVTEXiOS` (Xcode)
are native WebView hosts with their own READMEs.

The root server picks a country from `?country=` (`utils.js`) and creates
checkout sessions, customer sessions and payments against the Yuno API with the
keys in `.env`.

## How to test

- **CI** (`.github/workflows/check-pins.yml`, every pull request and push to
  `main`): `npm run check:pins` at the root, Node 20. It fails when any tracked
  file loads the SDK from an exact version (`/v1.10.3/main.js`); only global
  `major.minor` paths (`/v1.10/main.js`) pass. Run it before every pull request.
- There are no unit tests. The root `npm test` is the npm placeholder and exits 1.
- Per sub-project: `npm run lint` (`yuno-react` only), `npm run build` to
  typecheck, `npm test` (`yuno-angular`, `ng test`).
- Dependency fixes: `npm audit` in the affected sub-project must report 0
  vulnerabilities.
- Behaviour is verified by hand: run the server, open the page you changed,
  complete the flow in sandbox.

## Architecture

```
server.js              Express backend for the vanilla pages (port 8080), calls the Yuno API
utils.js               country data (currency, document, amount) per ?country=
vanilla/pages|static   one HTML page + one script per integration flow
yuno-angular/          Angular 21 demo (standalone)
yuno-react/            React 19 + Vite demo
yuno-vue/              Vue 3 + Vite demo
yuno-vtex-webview/     VTEX headless demo: HeadlessVTEXWeb (Vite) + Android + iOS hosts
white-label-proxy-server/  serves the SDK from a non-Yuno origin (own AGENTS.md)
typescript/types.ts    TypeScript shapes of the demo requests (customer, addresses, ...)
scripts/check-cdn-pins.mjs  the CI pin check
```

- A new flow in the vanilla demo is a page in `vanilla/pages`, its script in
  `vanilla/static`, a route in `server.js`, and a README section.
- The framework demos depend on `@yuno-payments/sdk-web` and
  `@yuno-payments/sdk-web-types` from npm; the vanilla pages load the CDN build.
- The demos use the white-label-neutral API (`window.SdkPayments`,
  `sdk-payments-ready`); `window.Yuno` remains a legacy alias in the SDK.

## Conventions

- Default and base branch: `main` (protected, requires a pull request).
- Branch: `<type>/<TICKET>-short-description` (`fix/VULS-XXXX-...`,
  `feat/<TICKET>-...`, `docs/<TICKET>-...`).
- Commit and PR title: `<type>:[<TICKET>] description`, e.g.
  `fix:[VULS-XXXX] bump vite in yuno-vue`. Types: `feat`, `fix`, `docs`,
  `chore`, `test`.
- No changesets and no release process; `package.json` versions are not bumped
  for example changes.
- Dependencies: each sub-project manages its own. Bump direct dependencies in
  its `package.json`; force transitive ones with `overrides`. After any change,
  regenerate the lockfile (`rm package-lock.json && npm install --package-lock-only`)
  and confirm `npm audit` is clean.
- Dependabot alerts: the alert's manifest path names the sub-project. Fix it
  there, not at the root.

## Engineering standards

- **Nothing is done until it is tested.** Run `npm run check:pins` and the
  build (and lint where it exists) of every sub-project you touched, then
  exercise the changed flow in a browser.
- **Examples are copied verbatim by merchants.** Show the documented public
  API only, keep error handling in the snippet, and keep README and code in
  sync: a README snippet that no longer matches the demo is a bug.
- **Clean code:** small functions, clear names, no dead or commented-out code,
  comments explain why. Follow the structure the sub-project already uses; do
  not add a second way of doing the same thing.
- **SDK version paths:** always the global `major.minor` path; never an exact
  version (immutable builds never receive fixes). Do not bump the line used by
  the examples without the SDK team.
- **Security:** API keys come from `.env` (gitignored; `.env.example` lists the
  names, never values). The private secret key stays in `server.js`, never in
  browser code. No PAN, CVV or PII in logs, console output or committed
  fixtures; card data is captured only by the SDK's secure fields.

## Pull requests

- One pull request resolves one work item and touches only what that item needs.
  Put `Fixes <work item code>` in the description; AnyForge links the pull
  request from that line.
- Leave what you touch better than you found it, inside that scope.
- A refactor or improvement that would change more than 3 files beyond the fix
  is a separate pull request with its own AnyForge work item. Mention it; do not
  fold it in.
- Never merge, tag, publish, release or deploy. A person does that.

## Traps

- **`README.md` says `npm start`; the root script is `npm run start:dev`.**
- **`vanilla/pages/index.html` loads the SDK through the local white-label
  proxy** (`http://localhost:9090/hosted-payment-methods/hosted-payment-form/orchestrator/v1.0/main.js`),
  with the production script tag commented out. The index page only works with
  the proxy running and `BASE_PATH` set to that prefix.
- **An exact SDK version anywhere in the repo fails CI**, including a
  host-less `SDK_MAIN_JS` value or a comment. Placeholders like `/v<semver>/`
  are allowed.
- **Lockfiles are per sub-project.** Running `npm install` at the root does not
  touch `yuno-react` or `yuno-vue`; a security fix needs its lockfile
  regenerated in the right directory.
- **`yuno-react` lint does not pass on `main`** (`react/prop-types` rule not
  found, unused `error` variables). Do not treat those errors as yours.

## Keeping this file true

If something here is wrong — a command that no longer works, a version that
moved, a trap that is gone — fix it in the same pull request that found it.
