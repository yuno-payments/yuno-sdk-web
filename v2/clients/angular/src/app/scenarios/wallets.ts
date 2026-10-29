// Mode: manual. Wallet buttons are self-driving views: tapping one is "pay now", no start() call needed.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the wallet buttons the device supports, in your own layout.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

// A wallet the session or the device cannot offer throws on mount: skip it and keep the others.
function mount(label: string, run: () => void) {
  try { run(); console.log(`mounted ${label}`) } catch (error) { console.warn(`skipped ${label}: ${(error as Error).message}`) }
}

@Component({
  selector: 'app-wallets',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scenario path="wallets" [status]="status()">
      <div class="wallets"><div id="apple-pay"></div><div id="google-pay"></div><div id="paypal"></div></div>
      <div id="sdk-root"></div>
    </app-scenario>
  `,
})
export class Wallets {
  private readonly api = inject(MerchantApi)

  readonly status = startTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await this.api.createCustomer({ country })
    const { checkout_session: checkoutSession } = await this.api.createCheckoutSession({ customerId: customer.id, country })

    const sdk = await SdkPayments.initialize(publicApiKey)
    const transaction = sdk.transaction({
      checkoutSession,
      countryCode: country,
      language,
      elementSelector: '#sdk-root',
      showStatusScreen: true,
      onStatus,
      createPayment: async (token) => {
        await this.api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    const views = transaction.getPaymentMethodsViews({
      types: ['applePay', 'googlePay', 'paypal'],
      onPaymentSelected: (paymentMethod) => console.log('[onPaymentSelected]', paymentMethod),
    })
    mount('Apple Pay', () => views.applePay?.mount({ elementSelector: '#apple-pay', buttonType: 'buy', buttonStyle: 'black' }))
    mount('Google Pay', () => views.googlePay?.mount({ elementSelector: '#google-pay', buttonColor: 'black', buttonType: 'pay' }))
    mount('PayPal', () => views.paypal?.mount({ elementSelector: '#paypal', color: 'gold', shape: 'pill' }))
    return transaction
  }).status
}
