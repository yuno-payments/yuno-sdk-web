import { Component, OnInit } from '@angular/core';
import { loadScript } from '@yuno-payments/sdk-web'
import { YunoInstance } from '@yuno-payments/sdk-web-types'

const PUBLIC_API_KEY = ''
const CHECKOUT_SESSION = ''

@Component({
    selector: 'app-sdk-full',
    imports: [],
    templateUrl: './sdk-full.component.html',
    styleUrl: './sdk-full.component.scss'
})
export class SdkFullComponent implements OnInit {
  yunoInstance?: YunoInstance
  async ngOnInit() {
    const yuno = await loadScript()
    this.yunoInstance = await yuno.initialize(PUBLIC_API_KEY)
    await this.yunoInstance.startCheckout({
      checkoutSession: CHECKOUT_SESSION,
      countryCode: 'CO',
      language: 'es',
      elementSelector: '#sdk-root',
      yunoCreatePayment: (oneTimeToken, tokenWithInformation)=> {
        console.log('tokenWithInformation', tokenWithInformation)
        console.log('oneTimeToken', oneTimeToken)
        // you create payment with token
        //
      }
    })
    this.yunoInstance.mountCheckout({})
  }

  onPayClick = ()=> {
    this.yunoInstance!.startPayment()
  }
}
