import { loadScript } from "@yuno-payments/sdk-web";
import type { YunoInstance } from "@yuno-payments/sdk-web-types";

const PUBLIC_API_KEY = "test";
const CHECKOUT_SESSION = "";
const PAYMENT_METHOD_TYPE = "CARD";
const VAULTED_TOKEN = undefined;

type YunoInstanceWithCanary = YunoInstance & { setCanaryMode: (enabled: boolean) => void };

let yunoInstance: YunoInstanceWithCanary | null = null;
let pendingCanaryMode = false;

export const startPayment = async () => {
  const yuno = await loadScript();
  yunoInstance = (await yuno.initialize(PUBLIC_API_KEY)) as YunoInstanceWithCanary;

  // Apply stored canary preference to the new SDK instance
  if (pendingCanaryMode) {
    yunoInstance.setCanaryMode(true);
  }

  await yunoInstance.startCheckout({
    checkoutSession: CHECKOUT_SESSION,
    elementSelector: "#yuno-root",
    countryCode: "CO",
    language: "es",
    async yunoCreatePayment(oneTimeToken, tokenWithInformation) {
      alert(`Token: ${oneTimeToken}`);
      console.log("token", oneTimeToken, tokenWithInformation);
    },
  });

  yunoInstance.mountCheckoutLite({
    paymentMethodType: PAYMENT_METHOD_TYPE,
    vaultedToken: VAULTED_TOKEN,
  });
};

export const setCanaryMode = (enabled: boolean) => {
  pendingCanaryMode = enabled;
  if (yunoInstance) {
    yunoInstance.setCanaryMode(enabled);
  }
};
