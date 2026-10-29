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

// mount() is async and rejects for a wallet the session or the device cannot offer: skip it, keep the others.
// A fulfilled mount means the SDK accepted the wallet; the button can still stay empty on a device without it.
const mounts = {
  'Apple Pay': views.applePay.mount({ elementSelector: '#apple-pay', buttonType: 'buy', buttonStyle: 'black' }),
  'Google Pay': views.googlePay.mount({ elementSelector: '#google-pay', buttonColor: 'black', buttonType: 'pay' }),
  PayPal: views.paypal.mount({ elementSelector: '#paypal', color: 'gold', shape: 'pill' }),
}
const results = await Promise.allSettled(Object.values(mounts))
Object.keys(mounts).forEach((label, i) => { if (results[i].status === 'rejected') console.warn(`skipped ${label}:`, results[i].reason) })
if (results.every((result) => result.status === 'rejected')) showStatus({ status: 'NO_WALLET', message: { code: 'none of the wallets can render for this session and device' } })
