// Mode: managed. The payment method list is a view you mount; start() renders the chosen method and pays.
// Server: creates the customer and a checkout session with workflow SDK_SEAMLESS.
// Shopper sees: the list in #payment-list, your Pay button, then the method's form in #sdk-root.
import { useRef, useState } from 'react'
import type { PaymentMethodSelected } from '../../../../types/sdk-payments'
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function PaymentListManaged() {
  const [valid, setValid] = useState(false)
  const [started, setStarted] = useState(false)
  const selected = useRef<PaymentMethodSelected>(undefined)

  const { status, transaction } = useTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
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
      onChange: ({ form }) => setValid(form.isValid),
    })
    const { paymentMethodList } = transaction.getPaymentMethodsViews({
      types: ['paymentMethodList'],
      // selectionSource is 'auto' when the SDK preselected a method; only 'user' is shopper intent.
      onPaymentSelected: (paymentMethod) => { selected.current = paymentMethod },
    })
    paymentMethodList?.mount({ elementSelector: '#payment-list' })
    return transaction
  })

  return (
    <Scenario path="payment-list-managed" status={status}>
      <div id="payment-list" />
      <button disabled={!valid || started} onClick={() => { setStarted(true); transaction?.start({ paymentMethod: selected.current }).catch(console.error) }}>Pay</button>
      <div id="sdk-root" />
    </Scenario>
  )
}
