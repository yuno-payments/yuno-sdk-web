import { Component, OnInit } from '@angular/core';

const PUBLIC_API_KEY = 'staging_gAAAAABjnL4O3-hbUTovDItjvG-EjV3WNkZyrxDvqMphxOVqbBp5e4RlxJZNk0hF-Er_baVq3fgQeN3WR9pT9Fvfha-glV5vMtp-tTGwfGEcl2HZfCttq77I_Ql24gabCSvN5xTkrikRJwC9A2g5aHpVm37nnIfCgdt-rNNoVpjvSFpM15FIpj8='
const CHECKOUT_SESSION = '0360702d-d089-4a06-be9a-cd39f5b37ac6'

@Component({
  selector: 'app-sdk-full',
  standalone: true,
  imports: [],
  templateUrl: './sdk-full.component.html',
  styleUrl: './sdk-full.component.scss'
})
export class SdkFullComponent implements OnInit {
  yunoInstance = Yuno.initialize(PUBLIC_API_KEY)
  ngOnInit() {
    this.yunoInstance.startCheckout({
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
    this.yunoInstance.startPayment()
  }
}
