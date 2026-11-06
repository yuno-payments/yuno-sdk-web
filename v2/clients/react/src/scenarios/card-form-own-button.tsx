// Mode: manual, with your own pay button. showPayButton: false hides the SDK button; submit() sends the form.
// Server: same as card-form-manual.
// Shopper sees: the Yuno card form without a button, and your button below it.
import { useState } from 'react'
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function CardFormOwnButton() {
  const [valid, setValid] = useState(false)

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
      showPayButton: false,
      onStatus,
      // Enable your button only while every required field is valid.
      onChange: ({ form }) => setValid(form.isValid),
      createPayment: async (token) => {
        await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  })

  return (
    <Scenario path="card-form-own-button" status={status}>
      <div id="sdk-root" />
      <button disabled={!valid || !transaction} onClick={() => transaction?.submit()}>Pay</button>
    </Scenario>
  )
}
