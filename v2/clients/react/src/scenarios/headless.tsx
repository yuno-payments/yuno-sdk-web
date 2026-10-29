// Mode: manual, headless. No SDK form: start() receives the card data, tokenizes it and runs 3DS if needed.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: nothing from the SDK until a 3DS challenge or the result screen. Only for PCI-scoped merchants.
import { useState } from 'react'
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function Headless() {
  const { status, transaction } = useTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await api.createCustomer({ country })
    const { checkout_session: checkoutSession } = await api.createCheckoutSession({ customerId: customer.id, country })

    const sdk = await SdkPayments.initialize(publicApiKey)
    return sdk.transaction({
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
  })

  const [started, setStarted] = useState(false)

  // start() is single-shot: the button stays disabled after the first click.
  const pay = () => {
    setStarted(true)
    transaction?.start({
      paymentMethod: {
        type: 'CARD',
        // Yuno test gateway card (docs.y.uno/docs/yuno-sdk/get-started#test-cards). In production this is the data your own form collected.
        data: { card: { number: '4507990000000002', expirationMonth: 11, expirationYear: 28, securityCode: '123', holderName: 'John Doe' } },
      },
    }).catch(console.error)
  }

  return (
    <Scenario path="headless" status={status}>
      <button disabled={!transaction || started} onClick={pay}>Pay with the test card</button>
      <div id="sdk-root" />
    </Scenario>
  )
}
