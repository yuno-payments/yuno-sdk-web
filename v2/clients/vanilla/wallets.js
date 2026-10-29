// Mode: manual. Wallet buttons are self-driving views: tapping one is "pay now", no start() call needed.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the wallet buttons the device supports, in your own layout.
import { loadSdk, showStatus } from './sdk.js'
import { api } from './api.js'

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

const views = transaction.getPaymentMethodsViews({
  types: ['applePay', 'googlePay', 'paypal'],
  onPaymentSelected: (paymentMethod) => console.log('[onPaymentSelected]', paymentMethod),
})

// A wallet the session or the device cannot offer throws on mount: skip it and keep the others.
let mounted = 0
function mount(label, run) {
  try { run(); mounted++; console.log(`mounted ${label}`) } catch (error) { console.warn(`skipped ${label}: ${error.message}`) }
}
mount('Apple Pay', () => views.applePay?.mount({ elementSelector: '#apple-pay', buttonType: 'buy', buttonStyle: 'black' }))
mount('Google Pay', () => views.googlePay?.mount({ elementSelector: '#google-pay', buttonColor: 'black', buttonType: 'pay' }))
mount('PayPal', () => views.paypal?.mount({ elementSelector: '#paypal', color: 'gold', shape: 'pill' }))
if (mounted === 0) showStatus({ status: 'NO_WALLET', message: { code: 'none of the wallets can render for this session and device' } })
