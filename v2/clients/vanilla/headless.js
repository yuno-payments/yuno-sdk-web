// Mode: manual, headless. No SDK form: start() receives the card data, tokenizes it and runs 3DS if needed.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: nothing from the SDK until a 3DS challenge or the result screen. Only for PCI-scoped merchants.
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

document.getElementById('pay').addEventListener('click', () =>
  transaction.start({
    paymentMethod: {
      type: 'CARD',
      // Yuno test gateway card (docs.y.uno/docs/yuno-sdk/get-started#test-cards). In production this is the data your own form collected.
      data: { card: { number: '4507990000000002', expirationMonth: 11, expirationYear: 28, securityCode: '123', holderName: 'John Doe' } },
    },
  }),
)
