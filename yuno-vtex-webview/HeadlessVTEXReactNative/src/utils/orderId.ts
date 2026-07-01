/**
 * Generates a random VTEX-orderFormId-like value: 32 lowercase hex chars
 * (same shape as e.g. "f9ddf32aac45446e97a86f80fb18c977").
 *
 * Math.random is fine here — this is a demo test id, not a security value.
 */
const HEX = '0123456789abcdef';
const ORDER_FORM_ID_LENGTH = 32;

export function generateOrderFormId(): string {
  let id = '';
  for (let i = 0; i < ORDER_FORM_ID_LENGTH; i += 1) {
    id += HEX[Math.floor(Math.random() * HEX.length)];
  }
  return id;
}
