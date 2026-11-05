// Mode: manual, with your own pay button. showPayButton: false hides the SDK button; submit() sends the form.
// Server: same as card-form-manual.
// Shopper sees: the Yuno card form without a button, and your button below it.
import { loadSdk, showStatus } from './sdk.js'
import { api } from './api.js'

const payButton = document.getElementById('pay')

const { publicApiKey, country, language } = await api.config()
const customer = await api.createCustomer({ country })
const { checkout_session: checkoutSession } = await api.createCheckoutSession({ customerId: customer.id, country })

const SdkPayments = await loadSdk()
const sdk = await SdkPayments.initialize(publicApiKey)

const transaction = sdk.transaction({
  checkoutSession,
  countryCode: country,
  language,
  elementSelector: '#sdk-root',
  showStatusScreen: true,
  showPayButton: false,
  onStatus: showStatus,
  // Enable your button only while every required field is valid.
  onChange: ({ form }) => { payButton.disabled = !form.isValid },
  createPayment: async (token) => {
    await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
  },
})

await transaction.start({ paymentMethod: { type: 'CARD' } })

payButton.addEventListener('click', () => transaction.submit())
