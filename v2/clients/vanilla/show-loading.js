// Mode: manual, with your own loader. A showLoading handler replaces the SDK full-screen overlay.
// Server: same as card-form-manual.
// Shopper sees: the Yuno card form and your "loading…" text instead of the Yuno overlay.
import { loadSdk, showStatus } from './sdk.js'
import { api } from './api.js'

const loader = document.getElementById('loader-status')

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
  showLoading: (isLoading) => { loader.textContent = isLoading ? 'loading…' : 'idle' },
  createPayment: async (token) => {
    await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
  },
})

await transaction.start({ paymentMethod: { type: 'CARD' } })
