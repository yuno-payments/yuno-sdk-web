/**
 * POST /session/preflight/payments — sends the wallet one-time token (OTT)
 * wrapped in a Yuno Create Payment payload. The connector validates the
 * fingerprint, injects checkout.session + account_id, and creates the payment
 * in Yuno. Step 5 of the flow.
 *
 * The payment body mirrors the web connector's buildPaymentBody so the connector
 * receives an identical shape regardless of the (web vs mobile) caller.
 */

import {VTEX, TEST_CUSTOMER} from '../config';
import {logger, mask} from '../utils/logger';
import type {CreatePreflightPaymentInput, PreflightPaymentResponse} from './types';

export function buildPaymentBody(
  input: CreatePreflightPaymentInput,
): Record<string, unknown> {
  const {orderFormId, checkoutSession, oneTimeToken, paymentMethodType, amount, currency, country} =
    input;

  return {
    description: `Payment for order ${orderFormId}`,
    country,
    merchant_order_id: orderFormId,
    amount: {currency, value: amount},
    checkout: {session: checkoutSession},
    payment_method: {token: oneTimeToken, type: paymentMethodType},
    workflow: 'CHECKOUT',
    customer_payer: {
      first_name: TEST_CUSTOMER.firstName,
      last_name: TEST_CUSTOMER.lastName,
      email: TEST_CUSTOMER.email,
      document: {
        document_number: TEST_CUSTOMER.documentNumber,
        document_type: TEST_CUSTOMER.documentType,
      },
      phone: {
        country_code: TEST_CUSTOMER.phoneCountryCode,
        number: TEST_CUSTOMER.phoneNumber,
      },
      shipping_address: {
        address_line_1: TEST_CUSTOMER.address.line1,
        address_line_2: TEST_CUSTOMER.address.line2,
        country: TEST_CUSTOMER.address.country,
        state: TEST_CUSTOMER.address.state,
        city: TEST_CUSTOMER.address.city,
        zip_code: TEST_CUSTOMER.address.zipCode,
      },
    },
  };
}

export async function createPreflightPayment(
  input: CreatePreflightPaymentInput,
  signal?: AbortSignal,
): Promise<PreflightPaymentResponse> {
  const requestBody = {
    orderFormId: input.orderFormId,
    payment: buildPaymentBody(input),
    affiliationName: input.affiliationName,
    createPaymentInAuth: input.createPaymentInAuth,
  };

  const url = VTEX.baseUrl + VTEX.preflightPaymentsPath;
  logger.info('preflight/payments → POST', {
    url,
    orderFormId: input.orderFormId,
    paymentMethodType: input.paymentMethodType,
    token: mask(input.oneTimeToken),
    amount: input.amount,
    currency: input.currency,
    country: input.country,
    createPaymentInAuth: input.createPaymentInAuth ?? false,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(requestBody),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    logger.error('preflight/payments ← failed', {status: response.status, detail});
    throw new Error(`Preflight payment failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as PreflightPaymentResponse;
  logger.info('preflight/payments ← 200', {id: data.id, status: data.status});
  return data;
}
