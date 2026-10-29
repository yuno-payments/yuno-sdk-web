// Mode: enrollment. customerSession instead of checkoutSession: the same transaction() saves a card instead of paying.
// Server: creates the customer, a customer session and the enrollment intent for CARD.
// Shopper sees: the Yuno enrollment form, then the result screen.
import { loadSdk, showStatus } from './sdk.js'
import { api } from './api.js'

const { publicApiKey, country, language } = await api.config()
const customer = await api.createCustomer({ country })
const { customer_session: customerSession } = await api.createCustomerSession({ customerId: customer.id, country })
await api.enrollPaymentMethod({ customerSession, country, type: 'CARD' })

const SdkPayments = await loadSdk()
const sdk = await SdkPayments.initialize(publicApiKey)

const transaction = sdk.transaction({
  customerSession,
  countryCode: country,
  language,
  elementSelector: '#sdk-root',
  showStatusScreen: true,
  onStatus: showStatus,
})

await transaction.start()
