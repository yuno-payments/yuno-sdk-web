// Ask for this key to sales department: PUBLIC_API_KEY
export async function getPublicApiKey() {
  return fetch(`/public-api-key${window.location.search}`, {
    method: 'GET'
  })
  .then(resp => resp.json())
  .then(resp => resp.publicApiKey)
}

export async function getCheckoutSession() {
  return fetch(`/checkout/sessions${window.location.search}`, {
    method: 'POST'
  })
  .then(resp => resp.json())
}

export async function getSeamlessCheckoutSession() {
  return fetch(`/checkout/seamless/sessions${window.location.search}`, {
    method: 'POST'
  })
  .then(resp => resp.json())
}

export async function createPayment(data) {
  return fetch(`/payments${window.location.search}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(resp => resp.json())
}

export async function getCustomerSession() {
  return fetch(`/customers/sessions${window.location.search}`, {
    method: 'POST'
  })
  .then(resp => resp.json())
}

export async function createEnrollment(customerSession) {
  return fetch(`/customers/sessions/${customerSession}/payment-methods${window.location.search}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(resp => resp.json())
}

export async function getPaymentMethods(checkoutSession) {
  return fetch(`/payment-methods/${checkoutSession}`, {
    method: 'GET'
  })
  .then(resp => resp.json())
}