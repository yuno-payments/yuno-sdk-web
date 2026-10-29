// Mode: manual. Same list as payment-list-managed; createPayment hands you the one-time token.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the list, your Pay button, the method's form, then the result screen.
import { loadSdk, showStatus } from './sdk.js'
import { api } from './api.js'

const payButton = document.getElementById('pay')
let selected

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
  onChange: ({ form }) => { payButton.disabled = !form.isValid },
  createPayment: async (token) => {
    await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
  },
})

const { paymentMethodList } = transaction.getPaymentMethodsViews({
  types: ['paymentMethodList'],
  onPaymentSelected: (paymentMethod) => { selected = paymentMethod },
})
paymentMethodList.mount({ elementSelector: '#payment-list' })

// start() is single-shot: the button stays disabled after the first click.
payButton.addEventListener('click', () => {
  payButton.disabled = true
  transaction.start({ paymentMethod: selected }).catch((error) => showStatus({ status: 'ERROR', message: { code: error.message } }))
})
