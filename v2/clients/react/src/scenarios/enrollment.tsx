// Mode: enrollment. customerSession instead of checkoutSession: the same transaction() saves a card instead of paying.
// Server: creates the customer, a customer session and the enrollment intent for CARD.
// Shopper sees: the Yuno enrollment form, then the result screen.
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function Enrollment() {
  const { status } = useTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await api.createCustomer({ country })
    const { customer_session: customerSession } = await api.createCustomerSession({ customerId: customer.id, country })
    await api.enrollPaymentMethod({ customerSession, country, type: 'CARD' })

    const sdk = await SdkPayments.initialize(publicApiKey)
    const transaction = sdk.transaction({
      customerSession,
      countryCode: country,
      language,
      elementSelector: '#sdk-root',
      showStatusScreen: true,
      onStatus,
    })
    await transaction.start()
    return transaction
  })

  return (
    <Scenario path="enrollment" status={status}>
      <div id="sdk-root" />
    </Scenario>
  )
}
