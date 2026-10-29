// Mode: manual, with your own loader. A showLoading handler replaces the SDK full-screen overlay.
// Server: same as card-form-manual.
// Shopper sees: the Yuno card form and your "loading…" text instead of the Yuno overlay.
import { useState } from 'react'
import { Scenario } from '../app'
import { api } from '../lib/api'
import { useTransaction } from '../hooks/use-transaction'

export function ShowLoading() {
  const [loading, setLoading] = useState(false)

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
      showLoading: setLoading,
      createPayment: async (token) => {
        await api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  })

  return (
    <Scenario path="show-loading" status={status}>
      <div id="loader-status">{loading ? 'loading…' : 'idle'}</div>
      <div id="sdk-root" />
    </Scenario>
  )
}
