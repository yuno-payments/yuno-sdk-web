// Mode: managed. The SDK renders the card form, creates the payment and shows the status screen.
// Server: creates a customer and a checkout session with workflow SDK_SEAMLESS.
// Shopper sees: the Yuno card form, then the Yuno result screen.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-card-form-managed',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-scenario path="card-form-managed" [status]="status()"><div id="sdk-root"></div></app-scenario>`,
})
export class CardFormManaged {
  private readonly api = inject(MerchantApi)

  readonly status = startTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
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
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  }).status
}
