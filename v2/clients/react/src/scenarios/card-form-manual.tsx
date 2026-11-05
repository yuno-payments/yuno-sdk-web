// Mode: manual. The SDK renders the card form; on submit it hands the one-time token to createPayment.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the Yuno card form, then the Yuno result screen once your payment exists.
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function CardFormManual() {
  const { status } = useTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await api.createCustomer({ country })
    const { checkout_session: checkoutSession } = await api.createCheckoutSession({ customerId: customer.id, country })

    const sdk = await SdkPayments.initialize(publicApiKey)
    const transaction = sdk.transaction({
      checkoutSession,
      countryCode: country,
      language,
      elementSelector: '#sdk-root',
      showStatusScreen: true,
      onStatus,
      // Presence of createPayment switches the transaction to manual mode.
      createPayment: async (token) => {
        await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  })

  return (
    <Scenario path="card-form-manual" status={status}>
      <div id="sdk-root" />
    </Scenario>
  )
}
