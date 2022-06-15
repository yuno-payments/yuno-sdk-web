// Ask for this key to sales department: PUBLIC_API_KEY
export async function getPublicApiKey() {
  return fetch('/public-api-key', {
    method: 'GET'
  })
  .then(resp => resp.json())
  .then(resp => resp.publicApiKey)
}

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