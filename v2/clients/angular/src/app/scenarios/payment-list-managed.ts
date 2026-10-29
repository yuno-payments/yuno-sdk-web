// Mode: managed. The payment method list is a view you mount; start() renders the chosen method and pays.
// Server: creates the customer and a checkout session with workflow SDK_SEAMLESS.
// Shopper sees: the list in #payment-list, your Pay button, then the method's form in #sdk-root.
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import type { PaymentMethodSelected } from '../../../../../types/sdk-payments'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-payment-list-managed',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scenario path="payment-list-managed" [status]="run.status()">
      <div id="payment-list"></div>
      <button [disabled]="!valid()" (click)="run.transaction()?.start({ paymentMethod: selected })">Pay</button>
      <div id="sdk-root"></div>
    </app-scenario>
  `,
})
export class PaymentListManaged {
  private readonly api = inject(MerchantApi)
  protected readonly valid = signal(false)
  protected selected?: PaymentMethodSelected

  protected readonly run = startTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await this.api.createCustomer({ country })
    const { checkout_session: checkoutSession } = await this.api.createCheckoutSession({ customerId: customer.id, country, workflow: 'SDK_SEAMLESS' })

    const sdk = await SdkPayments.initialize(publicApiKey)
    const transaction = sdk.transaction({
      checkoutSession,
      countryCode: country,
      language,
      elementSelector: '#sdk-root',
      showStatusScreen: true,
      onStatus,
      onChange: ({ form }) => this.valid.set(form.isValid),
    })
    const { paymentMethodList } = transaction.getPaymentMethodsViews({
      types: ['paymentMethodList'],
      // selectionSource is 'auto' when the SDK preselected a method; only 'user' is shopper intent.
      onPaymentSelected: (paymentMethod) => { this.selected = paymentMethod },
    })
    paymentMethodList?.mount({ elementSelector: '#payment-list' })
    return transaction
  })
}
