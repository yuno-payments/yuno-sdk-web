// Calls to the merchant server in ../../../server, proxied by Vite under /api. Same six calls in every client.
// ?country=BR&language=pt in the URL override the server defaults for one page load.

const query = new URLSearchParams(location.search)

async function post<T>(route: string, body: unknown): Promise<T> {
  const response = await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!response.ok) throw new Error(`${route} → ${response.status}: ${await response.text()}`)
  return response.json()
}

export interface Config { publicApiKey: string; country: string; language: string }

export const api = {
  async config(): Promise<Config> {
    const { publicApiKey, country } = await fetch('/api/config').then((r) => r.json())
    return { publicApiKey, country: query.get('country') ?? country, language: query.get('language') ?? 'en' }
  },
  createCustomer: (body: { country: string }) => post<{ id: string }>('/api/customers', body),
  createCheckoutSession: (body: { customerId: string; country: string; workflow?: string }) =>
    post<{ checkout_session: string }>('/api/checkout-sessions', body),
  createPayment: (body: { oneTimeToken: string; checkoutSession: string; customerId: string; country: string; type?: string }) =>
    post<unknown>('/api/payments', body),
  createCustomerSession: (body: { customerId: string; country: string }) =>
    post<{ customer_session: string }>('/api/customer-sessions', body),
  enrollPaymentMethod: ({ customerSession, ...body }: { customerSession: string; country: string; type: string }) =>
    post<unknown>(`/api/customer-sessions/${customerSession}/payment-methods`, body),
}
