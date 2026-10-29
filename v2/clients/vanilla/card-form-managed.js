// Mode: managed. The SDK renders the card form, creates the payment and shows the status screen.
// Server: creates a customer and a checkout session with workflow SDK_SEAMLESS.
// Shopper sees: the Yuno card form, then the Yuno result screen.
import { loadSdk, showStatus } from './sdk.js'
import { api } from './api.js'

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
})

await transaction.start({ paymentMethod: { type: 'CARD' } })
