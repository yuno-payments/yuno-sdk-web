import { Component, OnInit } from '@angular/core';

import { loadScript } from '@yuno-payments/sdk-web';
import { SdkPaymentsInstance } from '@yuno-payments/sdk-web-types';

const PUBLIC_API_KEY = '';
const CHECKOUT_SESSION = '';

type YunoInstanceWithCanary = SdkPaymentsInstance & { setCanaryMode: (enabled: boolean) => void };

@Component({
  selector: 'app-sdk-full',
  imports: [],
  templateUrl: './sdk-full.component.html',
  styleUrl: './sdk-full.component.scss',
})
export class SdkFullComponent implements OnInit {
  yunoInstance?: YunoInstanceWithCanary;
  canaryMode = localStorage.getItem('canary-mode') === 'true';

  async ngOnInit() {
    const yuno = await loadScript();
    this.yunoInstance = (await yuno.initialize(PUBLIC_API_KEY)) as YunoInstanceWithCanary;

    // apply persisted canary preference to the new instance
    if (this.canaryMode) {
      this.yunoInstance.setCanaryMode(true);
    }

    await this.yunoInstance.startCheckout({
      checkoutSession: CHECKOUT_SESSION,
      countryCode: 'CO',
      language: 'es',
      elementSelector: '#sdk-root',
      createPayment: (oneTimeToken, tokenWithInformation) => {
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

  onCanaryToggleChange = (event: Event) => {
    const checkbox = event.target as HTMLInputElement;
    this.canaryMode = checkbox.checked;
    localStorage.setItem('canary-mode', String(this.canaryMode));
    if (this.yunoInstance) {
      this.yunoInstance.setCanaryMode(this.canaryMode);
    }
  };
}
