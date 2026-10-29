// Mode: manual. Same list as payment-list-managed; createPayment hands you the one-time token.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the list, your Pay button, the method's form, then the result screen.
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import type { PaymentMethodSelected } from '../../../../../types/sdk-payments'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-payment-list-manual',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scenario path="payment-list-manual" [status]="run.status()">
      <div id="payment-list"></div>
      <button [disabled]="!valid()" (click)="run.transaction()?.start({ paymentMethod: selected })">Pay</button>
      <div id="sdk-root"></div>
    </app-scenario>
  `,
})
export class PaymentListManual {
  private readonly api = inject(MerchantApi)
  protected readonly valid = signal(false)
  protected selected?: PaymentMethodSelected

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
      onChange: ({ form }) => this.valid.set(form.isValid),
      createPayment: async (token) => {
        await this.api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    const { paymentMethodList } = transaction.getPaymentMethodsViews({
      types: ['paymentMethodList'],
      onPaymentSelected: (paymentMethod) => { this.selected = paymentMethod },
    })
    paymentMethodList?.mount({ elementSelector: '#payment-list' })
    return transaction
  })
}
