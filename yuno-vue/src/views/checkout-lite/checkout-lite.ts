import { ref } from 'vue'
import { loadScript } from "@yuno-payments/sdk-web";
import type { YunoInstance } from "@yuno-payments/sdk-web-types";

const PUBLIC_API_KEY = "test";
const CHECKOUT_SESSION = "";
const PAYMENT_METHOD_TYPE = "CARD";
const VAULTED_TOKEN = undefined;

export const yunoInstance = ref<YunoInstance | null>(null)

export const startPayment = async () => {
  const yuno = await loadScript();
  const instance = await yuno.initialize(PUBLIC_API_KEY);
  yunoInstance.value = instance

  await instance.startCheckout({
    checkoutSession: CHECKOUT_SESSION,
    elementSelector: "#yuno-root",
    countryCode: "CO",
    language: "es",
    async yunoCreatePayment(oneTimeToken, tokenWithInformation) {
      alert(`Token: ${oneTimeToken}`);
      console.log("token", oneTimeToken, tokenWithInformation);
    },
  });

  instance.mountCheckoutLite({
    paymentMethodType: PAYMENT_METHOD_TYPE,
    vaultedToken: VAULTED_TOKEN,
  });
};
