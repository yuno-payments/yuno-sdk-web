# v2 examples: conventions

Read this before changing anything under `v2/`. It is written for people and for coding agents.

## What this folder is

Merchant-facing examples of the Yuno Universal SDK (v2) on Web. Three clients (vanilla, React, Angular) implement the same scenarios against one server. A reader compares the same scenario across clients line by line, so the three must stay parallel.

## Rules

1. **One scenario, one file.** Each scenario is one source file per client (`clients/vanilla/<name>.js`, `clients/react/src/scenarios/<name>.tsx`, `clients/angular/src/app/scenarios/<name>.ts`) under 60 lines. No shared "scenario base" abstraction: repetition between scenarios is the point.
2. **Same names everywhere.** Scenario names are the kebab-case list in `clients/vanilla/index.html`. Adding one means adding it to every client, to the README table and to `llms.txt`.
3. **Same header comment.** Every scenario file opens with three comment lines: `Mode:` (managed, manual, enrollment), `Server:` (which `/api` calls it makes), `Shopper sees:`.
4. **The server is the only place the private key exists.** Clients call `/api/*`; nothing else. No checkout session, customer id or key is hardcoded in a client.
5. **One bundle constant per client.** `SDK_URL` in `clients/vanilla/sdk.js` and its equivalents. v2 is published at full-version paths only, so the pin is exact; `scripts/check-cdn-pins.mjs` allows `v2.*` pins for that reason. Bump all clients together.
6. **No `@yuno-payments/*` npm dependency** until v2 packages exist (types: UMJ-183). TypeScript clients use `types/sdk-payments.d.ts`; extend it when an example needs a type, do not widen it speculatively.
7. **`start()` is single-shot.** Framework clients guard against a second call (React StrictMode runs effects twice; Angular re-enters routes) and call `transaction.unmount()` on teardown.
8. **Do not touch the Legacy (v1) samples** at the repository root from a v2 change.

## Public API the examples rely on

```
const sdk = await window.SdkPayments.initialize(publicApiKey)
const transaction = sdk.transaction({ checkoutSession | customerSession, countryCode, language, elementSelector,
                                      showStatusScreen, onStatus, onChange?, createPayment?, showPayButton?, showLoading? })
await transaction.start({ paymentMethod: { type, vaultedToken?, data? } })
transaction.getPaymentMethodsViews({ types, onPaymentSelected }).<view>.mount({ elementSelector, …style })
await transaction.secureFields()  →  create({ name: 'pan'|'expiration'|'cvv' }).mount(selector)
transaction.submit()  (only with showPayButton: false)
```

Source of truth for the surface: sdk-web `etc/sdk-web-v2.api.md` and `docs/NEW_PUBLIC_API.md` on the v2 branches, and the public docs at https://docs.y.uno/docs/yuno-sdk/introduction.

## Verifying a change

```bash
cd v2 && npm start                 # server + vanilla on :8090
npm run check:pins                 # from the repository root
```
React: `cd clients/react && npm run build` must pass (`tsc -b`), then `npm run dev` and open the route.
Angular: `cd clients/angular && npm run build` must pass (`ng build`), then `npm start` and open the route.

Open the changed scenario, complete a sandbox payment with a test card, confirm `[onStatus]` in the console and the `POST /payments` line in the server log. A scenario that only renders is not verified.
