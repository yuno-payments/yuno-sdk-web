// Mode: manual, headless. No SDK form: start() receives the card data, tokenizes it and runs 3DS if needed.
// Server: creates the customer and the checkout session, then creates the payment in POST /api/payments.
// Shopper sees: nothing from the SDK until a 3DS challenge or the result screen. Only for PCI-scoped merchants.
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ScenarioShell } from '../scenario-shell'
import { MerchantApi } from '../core/merchant-api.service'
import { startTransaction } from '../core/transaction'

@Component({
  selector: 'app-headless',
  imports: [ScenarioShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scenario path="headless" [status]="run.status()">
      <button [disabled]="!run.transaction() || started()" (click)="pay()">Pay with the test card</button>
      <div id="sdk-root"></div>
    </app-scenario>
  `,
})
export class Headless {
  private readonly api = inject(MerchantApi)

  protected readonly run = startTransaction(async ({ SdkPayments, publicApiKey, country, language, onStatus }) => {
    const customer = await this.api.createCustomer({ country })
    const { checkout_session: checkoutSession } = await this.api.createCheckoutSession({ customerId: customer.id, country })

    const sdk = await SdkPayments.initialize(publicApiKey)
    return sdk.transaction({
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
  })

  protected readonly started = signal(false)

  // start() is single-shot: the button stays disabled after the first click.
  protected pay() {
    this.started.set(true)
    this.run.transaction()?.start({
      paymentMethod: {
        type: 'CARD',
        // Yuno test gateway card (docs.y.uno/docs/yuno-sdk/get-started#test-cards). In production this is the data your own form collected.
        data: { card: { number: '4507990000000002', expirationMonth: 11, expirationYear: 28, securityCode: '123', holderName: 'John Doe' } },
      },
    }).catch(console.error)
  }
}
