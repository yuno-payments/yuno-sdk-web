/**
 * Contracts for the connector preflight endpoints.
 * Mirror the shapes in sdk-vtex-connector/node/routes/preflight/*.
 */

/** Request body for POST /session/preflight. */
export interface PreflightRequest {
  orderFormId: string;
  amount: number; // decimal units, not cents
  currency: string;
  country: string; // alpha-2 or alpha-3 (connector normalizes)
  affiliationName?: string;
}

/** 200 response of POST /session/preflight. */
export interface PreflightResponse {
  checkoutSession: string;
  publicApiKey: string;
}

/**
 * Response of POST /session/preflight/payments.
 * Normal mode returns the Yuno payment ({id, status}); deferred mode returns
 * { deferred: true } (the payment is created later, in the authorization phase).
 */
export interface PreflightPaymentResponse {
  id?: string;
  status?: string;
  deferred?: boolean;
  [key: string]: unknown;
}

/** Inputs the caller provides to build the payment body. */
export interface CreatePreflightPaymentInput {
  orderFormId: string;
  checkoutSession: string;
  oneTimeToken: string;
  paymentMethodType: string; // GOOGLE_PAY | APPLE_PAY
  amount: number;
  currency: string;
  country: string;
  affiliationName?: string;
  // When true, the connector defers payment creation to the VTEX authorization
  // phase instead of creating it now.
  createPaymentInAuth?: boolean;
}
