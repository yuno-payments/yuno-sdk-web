# Yuno Universal SDK (v2) · Web examples

The same ten payment and enrollment scenarios, written three times: vanilla JavaScript, React and Angular, all against one small merchant server. Pick your framework, open a scenario, read one file.

> Everything in this folder targets the **Universal SDK (v2)**, the "new Yuno SDK" in [docs.y.uno/docs/yuno-sdk](https://docs.y.uno/docs/yuno-sdk/introduction). The rest of this repository (`vanilla/`, `yuno-angular/`, `yuno-react/`, `yuno-vue/`) targets the Legacy (v1) SDK.

## Quick start: a sandbox card payment in three commands

```bash
cp v2/.env.example v2/.env    # fill ACCOUNT_CODE, PUBLIC_API_KEY, PRIVATE_SECRET_KEY with sandbox credentials
cd v2 && npm install
npm start                     # http://localhost:8090
```

Open http://localhost:8090/card-form-manual.html, pay with a [test card](https://docs.y.uno/docs/yuno-sdk/get-started#test-cards) (4507 9900 0000 0002, 11/28, 123, John Doe on the Yuno test gateway), and watch `[onStatus]` in the browser console and `POST /payments → 201` in the terminal.

The React and Angular clients run on their own dev server and proxy `/api` to the one above:

| Client | Folder | Run | Status |
|---|---|---|---|
| Vanilla JS | `clients/vanilla/` | served by `npm start` | ready |
| React 19 + Vite | `clients/react/` | `cd clients/react && npm install && npm run dev` → http://localhost:5173 | ready |
| Angular 21 | `clients/angular/` | `cd clients/angular && npm install && npm start` → http://localhost:4200 | ready |

## How a payment flows

```
browser                          your server (v2/server)              Yuno
  │  POST /api/customers ───────────► POST /v1/customers ─────────────►│
  │  POST /api/checkout-sessions ───► POST /v1/checkout/sessions ──────►│
  │  SdkPayments.initialize(publicApiKey)                               │
  │  sdk.transaction({ checkoutSession, … }).start({ paymentMethod })   │
  │        managed: the SDK creates the payment ───────────────────────►│
  │        manual:  createPayment(token) ──► POST /v1/payments ────────►│
  │  onStatus({ status: 'SUCCEEDED' })                                  │
```

- **Managed** (no `createPayment`): the checkout session is created with `workflow: 'SDK_SEAMLESS'` and Yuno creates the payment.
- **Manual** (`createPayment` present): the SDK hands you a one-time token and your server creates the payment.

## Scenarios

| Scenario | What it shows | Vanilla | React | Angular |
|---|---|---|---|---|
| Card form · managed | Smallest integration: form, payment and result screen by the SDK | [js](clients/vanilla/card-form-managed.js) | [tsx](clients/react/src/scenarios/card-form-managed.tsx) | [ts](clients/angular/src/app/scenarios/card-form-managed.ts) |
| Card form · manual | Same form, your server creates the payment in `createPayment` | [js](clients/vanilla/card-form-manual.js) | [tsx](clients/react/src/scenarios/card-form-manual.tsx) | [ts](clients/angular/src/app/scenarios/card-form-manual.ts) |
| Card form · own button | `showPayButton: false`, `onChange` enables your button, `submit()` | [js](clients/vanilla/card-form-own-button.js) | [tsx](clients/react/src/scenarios/card-form-own-button.tsx) | [ts](clients/angular/src/app/scenarios/card-form-own-button.ts) |
| Payment list · managed | `getPaymentMethodsViews({ types: ['paymentMethodList'] })`, then `start()` | [js](clients/vanilla/payment-list-managed.js) | [tsx](clients/react/src/scenarios/payment-list-managed.tsx) | [ts](clients/angular/src/app/scenarios/payment-list-managed.ts) |
| Payment list · manual | The list with `createPayment` | [js](clients/vanilla/payment-list-manual.js) | [tsx](clients/react/src/scenarios/payment-list-manual.tsx) | [ts](clients/angular/src/app/scenarios/payment-list-manual.ts) |
| Wallets | Apple Pay, Google Pay and PayPal buttons in your layout | [js](clients/vanilla/wallets.js) | [tsx](clients/react/src/scenarios/wallets.tsx) | [ts](clients/angular/src/app/scenarios/wallets.ts) |
| Headless | No SDK UI, card data passed to `start()` | [js](clients/vanilla/headless.js) | [tsx](clients/react/src/scenarios/headless.tsx) | [ts](clients/angular/src/app/scenarios/headless.ts) |
| Secure fields | PCI-isolated fields inside your form | [js](clients/vanilla/secure-fields.js) | [tsx](clients/react/src/scenarios/secure-fields.tsx) | [ts](clients/angular/src/app/scenarios/secure-fields.ts) |
| Enrollment | `customerSession` saves a card instead of paying | [js](clients/vanilla/enrollment.js) | [tsx](clients/react/src/scenarios/enrollment.tsx) | [ts](clients/angular/src/app/scenarios/enrollment.ts) |
| Own loader | `showLoading` replaces the SDK overlay | [js](clients/vanilla/show-loading.js) | [tsx](clients/react/src/scenarios/show-loading.tsx) | [ts](clients/angular/src/app/scenarios/show-loading.ts) |

Add `?country=BR&language=pt` to any page to change the session country and the SDK language.

## Good to know

- npm 11.4 can fail the Angular install with `Cannot read properties of null (reading 'edgesOut')`. Run `npm install --legacy-peer-deps` there; the plain Angular CLI scaffold hits the same bug.

- With `showStatusScreen: true`, `onStatus` is delivered when the shopper leaves the SDK result screen ("Back to home"), not when the screen appears. Set it to `false` to receive the status as soon as it is final and draw your own screen.
- On `localhost` the browser console shows CORS errors for `/v1/sdk/event-log/publish`. That is SDK telemetry refusing the local origin; it does not affect the payment.
- Which wallets render depends on your account's connections and on the device (Apple Pay needs Safari). A wallet view's `mount()` is async and rejects when the SDK cannot offer that wallet; the `wallets` scenario awaits all three, logs the skipped ones and shows `NO_WALLET` when none mounted. The SDK also reports a skipped wallet through `onStatus` as `INTERNAL_ERROR · UNEXPECTED_ERROR`; the wallets that did mount keep working.
- `server/` is a development sample. It has no authentication, trusts the customer and session ids the browser sends, and returns the Yuno API error body to the page so you can read it. Copy its routes and the one-time-token flow; add your own session handling and error mapping before it faces real shoppers.

## The SDK bundle

The clients load `https://sdk-web.y.uno/v2.2.0/main.js`, which sets `window.SdkPayments`. v2 releases are published at full-version paths only (there is no `/v2.2/`), so the pin is exact and lives in one place per client (`clients/vanilla/sdk.js`). New versions are listed in the [Web changelog](https://docs.y.uno/changelog/yuno-sdk/web). There is no npm runtime for v2; `types/sdk-payments.d.ts` gives TypeScript clients the types the examples use until a v2 types package is published.

## Layout

```
v2/
  server/index.js        Express. Keeps the private key, creates sessions, creates payments. Serves clients/vanilla.
  clients/vanilla/       index.html + one html and one js per scenario; sdk.js (loader), api.js (server calls)
  clients/react/         Vite + React 19; src/scenarios/<name>.tsx, src/hooks/use-transaction.ts, src/lib/{sdk,api}.ts
  clients/angular/       Angular 21; src/app/scenarios/<name>.ts, src/app/core/{transaction,yuno-sdk.service,merchant-api.service}.ts
  types/sdk-payments.d.ts  interim types for window.SdkPayments
  AGENTS.md              conventions, for people and coding agents
  llms.txt               index of every file above
```

## Configuration

| Variable | Meaning |
|---|---|
| `ACCOUNT_CODE` | Your Yuno account code |
| `PUBLIC_API_KEY` | Sent to the browser; its prefix (`sandbox_`, `staging_`, `prod_`) picks the API host |
| `PRIVATE_SECRET_KEY` | Never leaves the server |
| `COUNTRY` | Country of the sessions the server creates, default `CO` |
| `PORT` | Server port, default `8090` |
