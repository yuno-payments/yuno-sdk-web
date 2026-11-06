// Mode: manual, secure fields. The card inputs are Yuno iframes inside your form; start() tokenizes them.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: your form with three Yuno-hosted fields and your Pay button.
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
  onStatus: showStatus,
  createPayment: async (token) => {
    await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
  },
})

const fields = await transaction.secureFields()
fields.create({ name: 'pan', options: { label: 'Card number' } }).mount('#card-number')
fields.create({ name: 'expiration', options: { label: 'Expiry' } }).mount('#expiration')
fields.create({ name: 'cvv', options: { label: 'CVV' } }).mount('#cvv')

// start() is single-shot: the button stays disabled after the first click. A new attempt needs a new transaction.
payButton.addEventListener('click', async () => {
  payButton.disabled = true
  try {
    await transaction.start({ paymentMethod: { type: 'CARD', data: { card: { holderName: 'John Doe' } } } })
  } catch (error) {
    showStatus({ status: 'ERROR', message: { code: error.message } })
  }
})
