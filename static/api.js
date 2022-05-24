// Ask for these key to sales department PUBLIC_API_KEY
export const publicApiKey = 'PUBLIC_API_KEY'

export async function getCheckoutSession() {
  return fetch('/checkout/sessions', {
    method: 'POST'
  })
  .then(resp => resp.json())
}

export async function createPayment(data) {
  return fetch('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(resp => resp.json())
}