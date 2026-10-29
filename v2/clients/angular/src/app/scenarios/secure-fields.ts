// Mode: manual, secure fields. The card inputs are Yuno iframes inside your form; start() tokenizes them.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: your form with three Yuno-hosted fields and your Pay button.
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-secure-fields',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scenario path="secure-fields" [status]="run.status()">
      <div class="field"><label for="card-number">Card number</label><div id="card-number"></div></div>
      <div class="field"><label for="expiration">Expiry</label><div id="expiration"></div></div>
      <div class="field"><label for="cvv">CVV</label><div id="cvv"></div></div>
      <button [disabled]="!run.transaction() || paying()" (click)="pay()">Pay</button>
      <div id="sdk-root"></div>
    </app-scenario>
  `,
})
export class SecureFields {
  private readonly api = inject(MerchantApi)
  protected readonly paying = signal(false)

  protected readonly run = startTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
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
    const fields = await transaction.secureFields()
    fields.create({ name: 'pan', options: { label: 'Card number' } }).mount('#card-number')
    fields.create({ name: 'expiration', options: { label: 'Expiry' } }).mount('#expiration')
    fields.create({ name: 'cvv', options: { label: 'CVV' } }).mount('#cvv')
    return transaction
  })

  protected async pay() {
    this.paying.set(true)
    try { await this.run.transaction()?.start({ paymentMethod: { type: 'CARD', data: { card: { holderName: 'John Doe' } } } }) } finally { this.paying.set(false) }
  }
}
