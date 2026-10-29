// Mode: manual. Same list as payment-list-managed; createPayment hands you the one-time token.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the list, your Pay button, the method's form, then the result screen.
import { useRef, useState } from 'react'
import type { PaymentMethodSelected } from '../../../../types/sdk-payments'
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function PaymentListManual() {
  const [valid, setValid] = useState(false)
  const selected = useRef<PaymentMethodSelected>(undefined)

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
      onChange: ({ form }) => setValid(form.isValid),
      createPayment: async (token) => {
        await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    const { paymentMethodList } = transaction.getPaymentMethodsViews({
      types: ['paymentMethodList'],
      onPaymentSelected: (paymentMethod) => { selected.current = paymentMethod },
    })
    paymentMethodList?.mount({ elementSelector: '#payment-list' })
    return transaction
  })

  return (
    <Scenario path="payment-list-manual" status={status}>
      <div id="payment-list" />
      <button disabled={!valid} onClick={() => transaction?.start({ paymentMethod: selected.current })}>Pay</button>
      <div id="sdk-root" />
    </Scenario>
  )
}
