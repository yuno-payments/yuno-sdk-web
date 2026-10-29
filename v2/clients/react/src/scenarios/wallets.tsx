// Mode: manual. Wallet buttons are self-driving views: tapping one is "pay now", no start() call needed.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the wallet buttons the device supports, in your own layout.
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

// A wallet the session or the device cannot offer throws on mount: skip it and keep the others.
function mount(label: string, run: () => void): boolean {
  try { run(); console.log(`mounted ${label}`); return true } catch (error) { console.warn(`skipped ${label}: ${(error as Error).message}`); return false }
}

export function Wallets() {
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
      createPayment: async (token) => {
        await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    const views = transaction.getPaymentMethodsViews({
      types: ['applePay', 'googlePay', 'paypal'],
      onPaymentSelected: (paymentMethod) => console.log('[onPaymentSelected]', paymentMethod),
    })
    const mounted = [
      mount('Apple Pay', () => views.applePay?.mount({ elementSelector: '#apple-pay', buttonType: 'buy', buttonStyle: 'black' })),
      mount('Google Pay', () => views.googlePay?.mount({ elementSelector: '#google-pay', buttonColor: 'black', buttonType: 'pay' })),
      mount('PayPal', () => views.paypal?.mount({ elementSelector: '#paypal', color: 'gold', shape: 'pill' })),
    ].filter(Boolean).length
    if (mounted === 0) onStatus({ status: 'NO_WALLET', substatus: null, message: { source: 'sdk', code: 'none of the wallets can render for this session and device' } })
    return transaction
  })

  return (
    <Scenario path="wallets" status={status}>
      <div className="wallets"><div id="apple-pay" /><div id="google-pay" /><div id="paypal" /></div>
      <div id="sdk-root" />
    </Scenario>
  )
}
