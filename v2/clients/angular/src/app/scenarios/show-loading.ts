// Mode: manual, with your own loader. A showLoading handler replaces the SDK full-screen overlay.
// Server: same as card-form-manual.
// Shopper sees: the Yuno card form and your "loading…" text instead of the Yuno overlay.
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-show-loading',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scenario path="show-loading" [status]="status()">
      <div id="loader-status">{{ loading() ? 'loading…' : 'idle' }}</div>
      <div id="sdk-root"></div>
    </app-scenario>
  `,
})
export class ShowLoading {
  private readonly api = inject(MerchantApi)
  protected readonly loading = signal(false)

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
      showLoading: (isLoading) => this.loading.set(isLoading),
      createPayment: async (token) => {
        await this.api.createPayment({ oneTimeToken: token.token, checkoutSession, customerId: customer.id, country, type: token.type })
      },
    })
    await transaction.start({ paymentMethod: { type: 'CARD' } })
    return transaction
  }).status
}
