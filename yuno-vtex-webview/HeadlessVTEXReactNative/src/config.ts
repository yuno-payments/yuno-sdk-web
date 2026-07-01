/**
 * Demo configuration.
 *
 * orderFormId and order value are entered in the UI; the customer is a fixed
 * test buyer here (the same one used for every test run). A merchant replicating
 * this would source these from their own cart / signed-in customer.
 */

import {Platform} from 'react-native';

/** VTEX store host + the connector's public preflight routes. */
export const VTEX = {
  /** No trailing slash. The connector routes are `public: true` (no VTEX auth needed). */
  baseUrl: 'https://hugoriveros2--yunopartnerbr.myvtex.com',
  preflightPath: '/_v/yunopartnerbr.yuno/v4/session/preflight',
  preflightPaymentsPath: '/_v/yunopartnerbr.yuno/v4/session/preflight/payments',
} as const;

/**
 * Cart defaults. `amount`/`currency`/`country` MUST be identical between the two
 * preflight calls — the connector fingerprints them (a mismatch returns 409).
 */
export const CHECKOUT = {
  defaultAmount: 845.0, // decimal units (BRL) — editable in the UI. 84500 cents = R$ 845.00
  currency: 'BRL',
  country: 'BR', // ISO alpha-2 (VTEX order uses "BRA"; connector normalizes both to "BR")
  affiliationName: 'Yuno - Hugo Staging',
} as const;

/** Yuno SDK init options. */
export const YUNO = {
  countryCode: 'BR',
  language: 'pt',
} as const;

/**
 * `payment_method.type` sent to /preflight/payments for the wallet.
 * Confirmed against the Yuno methods list: 'GOOGLE_PAY' / 'APPLE_PAY'.
 * At runtime we prefer the value the SDK reports in `OneTimeTokenInfo.type`.
 */
export const WALLET_PAYMENT_TYPE = {
  ios: 'APPLE_PAY',
  android: 'GOOGLE_PAY',
} as const;

/** The wallet relevant to the current platform (Apple Pay on iOS, Google Pay on Android). */
export const ACTIVE_WALLET_TYPE: string =
  Platform.OS === 'ios' ? WALLET_PAYMENT_TYPE.ios : WALLET_PAYMENT_TYPE.android;

/** Fixed test buyer (mirrors the test VTEX orderForm's client + shipping address). */
export const TEST_CUSTOMER = {
  firstName: 'Hugo Felipe',
  lastName: 'Riveros Fajardo',
  email: 'hugoriverosfajardo@gmail.com',
  documentType: 'CPF',
  documentNumber: '12345678909',
  phoneCountryCode: '55',
  phoneNumber: '11987654321',
  address: {
    line1: 'Rua Augusta 123',
    line2: 'Consolação',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01304-001',
    country: 'BR',
  },
} as const;
