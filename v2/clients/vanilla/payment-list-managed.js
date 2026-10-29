// Mode: managed. The payment method list is a view you mount; start() renders the chosen method and pays.
// Server: creates the customer and a checkout session with workflow SDK_SEAMLESS.
// Shopper sees: the list in #payment-list, your Pay button, then the method's form in #sdk-root.
import { loadSdk, showStatus } from './sdk.js'
import { api } from './api.js'

const payButton = document.getElementById('pay')
let selected

const { publicApiKey, country, language } = await api.config()
const customer = await api.createCustomer({ country })
const { checkout_session: checkoutSession } = await api.createCheckoutSession({ customerId: customer.id, country, workflow: 'SDK_SEAMLESS' })

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
})

const { paymentMethodList } = transaction.getPaymentMethodsViews({
  types: ['paymentMethodList'],
  // selectionSource is 'auto' when the SDK preselected a method; only 'user' is shopper intent.
  onPaymentSelected: (paymentMethod) => { selected = paymentMethod },
})
paymentMethodList.mount({ elementSelector: '#payment-list' })

// start() is single-shot: the button stays disabled after the first click.
payButton.addEventListener('click', () => {
  payButton.disabled = true
  transaction.start({ paymentMethod: selected }).catch((error) => showStatus({ status: 'ERROR', message: { code: error.message } }))
})
