// Mode: managed. The SDK renders the card form, creates the payment and shows the status screen.
// Server: creates a customer and a checkout session with workflow SDK_SEAMLESS.
// Shopper sees: the Yuno card form, then the Yuno result screen.
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function CardFormManaged() {
  const { status } = useTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await api.createCustomer({ country })
    const { checkout_session: checkoutSession } = await api.createCheckoutSession({ customerId: customer.id, country, workflow: 'SDK_SEAMLESS' })

    const sdk = await SdkPayments.initialize(publicApiKey)
    const transaction = sdk.transaction({
      checkoutSession,
      countryCode: country,
      language,
      elementSelector: '#sdk-root',
      showStatusScreen: true,
      onStatus,
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  })

  return (
    <Scenario path="card-form-managed" status={status}>
      <div id="sdk-root" />
    </Scenario>
  )
}
