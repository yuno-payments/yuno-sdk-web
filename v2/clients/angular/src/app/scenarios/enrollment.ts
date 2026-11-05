// Mode: enrollment. customerSession instead of checkoutSession: the same transaction() saves a card instead of paying.
// Server: creates the customer, a customer session and the enrollment intent for CARD.
// Shopper sees: the Yuno enrollment form, then the result screen.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-enrollment',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-scenario path="enrollment" [status]="status()"><div id="sdk-root"></div></app-scenario>`,
})
export class Enrollment {
  private readonly api = inject(MerchantApi)

  readonly status = startTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await this.api.createCustomer({ country })
    const { customer_session: customerSession } = await this.api.createCustomerSession({ customerId: customer.id, country })
    await this.api.enrollPaymentMethod({ customerSession, country, type: 'CARD' })

    const sdk = await SdkPayments.initialize(publicApiKey)
    const transaction = sdk.transaction({
      customerSession,
      countryCode: country,
      language,
      elementSelector: '#sdk-root',
      showStatusScreen: true,
      onStatus,
    })
    await transaction.start()
    return transaction
  }).status
}
