// Mode: manual. The SDK renders the card form; on submit it hands the one-time token to createPayment.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: the Yuno card form, then the Yuno result screen once your payment exists.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-card-form-manual',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-scenario path="card-form-manual" [status]="status()"><div id="sdk-root"></div></app-scenario>`,
})
export class CardFormManual {
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
      // Presence of createPayment switches the transaction to manual mode.
      createPayment: async (token) => {
        await this.api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  }).status
}
