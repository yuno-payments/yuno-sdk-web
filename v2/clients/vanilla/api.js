// Calls to the merchant server in ../../server. Same six calls in every client.
// ?country=BR&language=pt in the URL override the server defaults for one page load.

const query = new URLSearchParams(location.search)

async function post(route, body) {
  const response = await fetch(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${route} → ${response.status}: ${await response.text()}`)
  return response.json()
}

export const api = {
  async config() {
    const { publicApiKey, country } = await fetch('/api/config').then((r) => r.json())
    return { publicApiKey, country: query.get('country') ?? country, language: query.get('language') ?? 'en' }
  },
  createCustomer: ({ country }) => post('/api/customers', { country }),
  createCheckoutSession: ({ customerId, country, workflow }) => post('/api/checkout-sessions', { customerId, country, workflow }),
  createPayment: ({ oneTimeToken, checkoutSession, customerId, country, type }) =>
    post('/api/payments', { oneTimeToken, checkoutSession, customerId, country, type }),
  createCustomerSession: ({ customerId, country }) => post('/api/customer-sessions', { customerId, country }),
  enrollPaymentMethod: ({ customerSession, country, type }) =>
    post(`/api/customer-sessions/${customerSession}/payment-methods`, { country, type }),
}
