import { loadScript } from "@yuno-payments/sdk-web";
import type { SdkPaymentsInstance } from "@yuno-payments/sdk-web-types";

const PUBLIC_API_KEY = "test";
const CHECKOUT_SESSION = "";
const PAYMENT_METHOD_TYPE = "CARD";
const VAULTED_TOKEN = undefined;

type YunoInstanceWithCanary = SdkPaymentsInstance & { setCanaryMode: (enabled: boolean) => void };

let yunoInstance: YunoInstanceWithCanary | null = null;
let initializingCheckout = false;
let pendingCanaryMode = localStorage.getItem("canary-mode") === "true";

export const startPayment = async () => {
  // guard: re-initializing on every click would replace the instance the
  // canary toggle points to while the first checkout is still mounted.
  // yunoInstance is only assigned after a successful mount so a failed
  // attempt can be retried; initializingCheckout blocks concurrent clicks
  if (yunoInstance || initializingCheckout) {
    return;
  }
  initializingCheckout = true;

  try {
    const yuno = await loadScript();
    const instance = (await yuno.initialize(PUBLIC_API_KEY)) as YunoInstanceWithCanary;

    // Apply stored canary preference to the new SDK instance
    if (pendingCanaryMode) {
      instance.setCanaryMode(true);
    }

    await instance.startCheckout({
      checkoutSession: CHECKOUT_SESSION,
      elementSelector: "#yuno-root",
      countryCode: "CO",
      language: "es",
      async createPayment(oneTimeToken, tokenWithInformation) {
        alert(`Token: ${oneTimeToken}`);
        console.log("token", oneTimeToken, tokenWithInformation);
      },
    });

    instance.mountCheckoutLite({
      paymentMethodType: PAYMENT_METHOD_TYPE,
      vaultedToken: VAULTED_TOKEN,
    });

    yunoInstance = instance;
    // re-sync in case the toggle changed while the checkout was mounting
    yunoInstance.setCanaryMode(pendingCanaryMode);
  } finally {
    initializingCheckout = false;
  }
};

export const setCanaryMode = (enabled: boolean) => {
  pendingCanaryMode = enabled;
  localStorage.setItem("canary-mode", String(enabled));
  if (yunoInstance) {
    yunoInstance.setCanaryMode(enabled);
  }
};
