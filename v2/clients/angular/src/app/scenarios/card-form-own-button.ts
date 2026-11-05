// Mode: manual, with your own pay button. showPayButton: false hides the SDK button; submit() sends the form.
// Server: same as card-form-manual.
// Shopper sees: the Yuno card form without a button, and your button below it.
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-card-form-own-button',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scenario path="card-form-own-button" [status]="run.status()">
      <div id="sdk-root"></div>
      <button [disabled]="!valid() || !run.transaction()" (click)="run.transaction()?.submit()">Pay</button>
    </app-scenario>
  `,
})
export class CardFormOwnButton {
  private readonly api = inject(MerchantApi)
  protected readonly valid = signal(false)

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
      showPayButton: false,
      onStatus,
      // Enable your button only while every required field is valid.
      onChange: ({ form }) => this.valid.set(form.isValid),
      createPayment: async (token) => {
        await this.api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  })
}
