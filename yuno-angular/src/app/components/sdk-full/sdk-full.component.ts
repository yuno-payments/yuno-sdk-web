import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadScript } from '@yuno-payments/sdk-web';
import { YunoInstance } from '@yuno-payments/sdk-web-types';

const PUBLIC_API_KEY = '';
const CHECKOUT_SESSION = '';

@Component({
  selector: 'app-sdk-full',
  imports: [CommonModule],
  templateUrl: './sdk-full.component.html',
  styleUrl: './sdk-full.component.scss',
})
export class SdkFullComponent implements OnInit {
  yunoInstance?: YunoInstance;
  canaryMode = false;

  async ngOnInit() {
    const yuno = await loadScript();
    this.yunoInstance = await yuno.initialize(PUBLIC_API_KEY);
    await this.yunoInstance.startCheckout({
      checkoutSession: CHECKOUT_SESSION,
      countryCode: 'CO',
      language: 'es',
      elementSelector: '#sdk-root',
      yunoCreatePayment: (oneTimeToken, tokenWithInformation) => {
        console.log('tokenWithInformation', tokenWithInformation);
        console.log('oneTimeToken', oneTimeToken);
        // you create payment with token
        //
      },
    });
    this.yunoInstance.mountCheckout();
  }

  onPayClick = () => {
    this.yunoInstance!.startPayment();
  };

  onCanaryToggle = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.canaryMode = target.checked;
    if (this.yunoInstance) {
      this.yunoInstance.setCanaryMode(this.canaryMode);
    }
  };
}
