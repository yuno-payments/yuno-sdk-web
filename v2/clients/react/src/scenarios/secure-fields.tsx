// Mode: manual, secure fields. The card inputs are Yuno iframes inside your form; start() tokenizes them.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: your form with three Yuno-hosted fields and your Pay button.
import { useState } from 'react'
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function SecureFields() {
  const [started, setStarted] = useState(false)

  const { status, transaction } = useTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
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
      createPayment: async (token) => {
        await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    const fields = await transaction.secureFields()
    fields.create({ name: 'pan', options: { label: 'Card number' } }).mount('#card-number')
    fields.create({ name: 'expiration', options: { label: 'Expiry' } }).mount('#expiration')
    fields.create({ name: 'cvv', options: { label: 'CVV' } }).mount('#cvv')
    return transaction
  })

  // start() is single-shot: the button stays disabled after the first click. A new attempt needs a new transaction.
  const pay = () => {
    setStarted(true)
    transaction?.start({ paymentMethod: { type: 'CARD', data: { card: { holderName: 'John Doe' } } } }).catch(console.error)
  }

  return (
    <Scenario path="secure-fields" status={status}>
      <div className="field"><label htmlFor="card-number">Card number</label><div id="card-number" /></div>
      <div className="field"><label htmlFor="expiration">Expiry</label><div id="expiration" /></div>
      <div className="field"><label htmlFor="cvv">CVV</label><div id="cvv" /></div>
      <button disabled={!transaction || started} onClick={pay}>Pay</button>
      <div id="sdk-root" />
    </Scenario>
  )
}
