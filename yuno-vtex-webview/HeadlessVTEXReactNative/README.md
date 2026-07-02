# HeadlessVTEXReactNative — Yuno RN SDK + VTEX preflight (Google Pay / Apple Pay)

Sample React Native app that processes **Google Pay (Android)** and **Apple Pay (iOS)**
using the **Yuno React Native SDK** integrated with the VTEX payment connector's
**preflight endpoints**. It demonstrates the headless VTEX mobile scenario for
merchants that own their checkout (e.g. Pague Menos).

Ticket: **CORECM-17894**. Full plan: `../../../IMPLEMENTATION_PLAN_CORECM-17894.md`.

## Flow

```
[App] POST /session/preflight                          ─▶ { checkoutSession, publicApiKey }
[App] YunoSdk.initialize(publicApiKey)
[App] <YunoPaymentMethods checkoutSession>              ─▶ user taps wallet, approves sheet
[SDK] onOneTimeToken(ott)
[App] POST /session/preflight/payments                 ─▶ { deferred: true }
      (token + GOOGLE_PAY/APPLE_PAY, createPaymentInAuth: true)
```

The payment is **always** created during the VTEX authorization phase (deferred):
`/preflight/payments` only stores the OTT and returns `{ deferred: true }`, so the
app does not resume the SDK. The Yuno payment is created when the VTEX order is
authorized, guaranteeing a payment is never created without an order behind it.

The amount/currency/country sent to both preflight calls must be identical
(the connector fingerprints them).

## Project layout

```
src/
├── App.tsx                       # boots straight into the checkout screen
├── config.ts                     # demo constants (VTEX host, cart, wallet types)
├── api/                          # connector preflight calls
│   ├── preflight.ts              # POST /session/preflight
│   ├── preflightPayments.ts      # POST /session/preflight/payments (+ buildPaymentBody)
│   └── types.ts
├── services/YunoService.ts       # thin wrapper over the Yuno RN SDK
├── hooks/
│   ├── useVtexWalletCheckout.ts  # orchestrates the whole flow
│   ├── useYunoEvents.ts          # SDK native events (OTT, status)
│   └── useAppStateForeground.ts  # Android OTT recovery on resume
├── screens/CheckoutScreen.tsx    # the single demo screen
├── components/ (Button, Card)    # reused from the base example
└── theme/                        # colors / spacing / typography
```

## Prerequisites

- Node ≥ 20, Watchman, the React Native CLI environment.
- **iOS:** Xcode + CocoaPods; a **real device** for Apple Pay (the simulator can't run it); the
  Apple Pay merchant id `merchant.com.y.uno.yuno.integrations` (inherited from the base example)
  must be active and provisioned for the bundle id `com.yunosdkexample`.
- **Android:** Android Studio + JDK 17; access to Yuno's JFrog Maven repo (for the native SDK);
  a `google-services.json` for package `com.yunosdkexample` (Google Pay path) — **not committed**.
- Access to the Yuno JFrog npm registry to install `@yuno-payments/yuno-sdk-react-native`.

## Connector must be live in the workspace ⚠️

The app calls the connector at `https://hugoriveros2--yunopartnerbr.myvtex.com`. Those
preflight routes only respond if the Yuno connector's `node` service is **running in that
workspace**. During development a direct call returned `500 Connection refused`, meaning the
service was not linked there. Before testing:

```bash
# in sdk-vtex-connector (on branch feat/CORECM-17894-rn-sdk-vtex-preflight-wallets)
vtex login yunopartnerbr
vtex use hugoriveros2
vtex link            # serves the preflight routes (and any connector changes) in the workspace
```

Verify the endpoint is up:

```bash
curl -X POST 'https://hugoriveros2--yunopartnerbr.myvtex.com/_v/yunopartnerbr.yuno/v4/session/preflight' \
  -H 'Content-Type: application/json' \
  -d '{"orderFormId":"f9ddf32aac45446e97a86f80fb18c977","amount":100.00,"currency":"BRL","country":"BR","affiliationName":"Yuno - Hugo Staging"}'
# expect: {"checkoutSession":"...","publicApiKey":"..."}
```

## Run

```bash
npm install

# iOS (real device for Apple Pay)
cd ios && pod install && cd ..
npm run ios   # or open ios/*.xcworkspace in Xcode, select your device, Run

# Android
npm run android
```

Then in the app: **Iniciar pagamento** → the Yuno payment-method list renders → select the
wallet → **Pagar** → approve in the wallet sheet → the screen shows the Yuno payment id/status.
Verify the payment in the Yuno staging dashboard.

## Configuration

All demo values live in `src/config.ts` (VTEX host, cart amount/currency/country, affiliation,
test customer, wallet type strings). A merchant replicating this would replace these with their
own store host and live cart/customer data.

## Known gotchas

- **Wallet type string** (`GOOGLE_PAY` / `APPLE_PAY`) is the working assumption for
  `payment_method.type`; confirm against the Yuno staging dashboard. The app prefers the type the
  SDK reports in `OneTimeTokenInfo.type` when present.
- **Apple Pay** requires a real device + a provisioning profile that matches the bundle id and the
  merchant id; the simulator will not show it.
- **Google Pay** needs `google-services.json` and Google Pay enabled for the account; without it the
  Android build/flow fails.
- `409` from `/preflight/payments` = fingerprint mismatch (amount/currency/country differ from the
  preflight call) → restart the flow. `404` = no session (re-run preflight) or affiliation not found.
- iOS leftovers from the base example: `MainViewController.swift` and `AppDelegate.navigateToReactNative`
  are no longer used (the app boots straight into RN); they can be removed from the Xcode target later.
