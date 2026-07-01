# CLAUDE.md — HeadlessVTEXReactNative

Sample React Native app: **Yuno RN SDK + VTEX connector preflight endpoints** for
Google Pay / Apple Pay (ticket CORECM-17894). Built from `yuno-sdk-react-native-example`,
re-purposed for the headless VTEX mobile flow. See `README.md` for run instructions and
`../../../IMPLEMENTATION_PLAN_CORECM-17894.md` for the full plan.

## What this app does

`preflight` → `YunoSdk.initialize(publicApiKey)` → `<YunoPaymentMethods>` → wallet OTT
(`onOneTimeToken`) → `preflight/payments` → `YunoSdk.continuePayment` → `onPaymentStatus`.

## Architecture

- `src/config.ts` — all demo constants (single source of truth to edit per environment).
- `src/api/` — connector preflight HTTP (infrastructure).
- `src/services/YunoService.ts` — thin SDK wrapper (infrastructure).
- `src/hooks/useVtexWalletCheckout.ts` — flow orchestration (application).
- `src/screens/CheckoutScreen.tsx` — presentation only; no business logic.

## Conventions

- TypeScript, typed props, no business logic in components.
- Flow logic stays in `useVtexWalletCheckout`; the screen only renders state + calls actions.
- Keep `amount`/`currency`/`country` identical across both preflight calls (fingerprint).
- The SDK is initialized in **JS** (not natively); Android still needs
  `YunoSdkModule.registerYunoCallbacks` in `YunoActivity.onCreate` before `super.onCreate()`.
- App/bundle identifiers are intentionally inherited from the base example
  (`YunoSDKExample`, `com.yunosdkexample`, Apple Pay merchant `merchant.com.y.uno.yuno.integrations`).

## Native entry (changed from the base example)

- Android: `YunoActivity` is the launcher (config-screen `MainActivity` removed).
- iOS: `AppDelegate` boots the RN root directly (`MainViewController` config screen no longer used).
