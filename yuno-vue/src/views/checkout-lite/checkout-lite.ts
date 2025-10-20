import { loadScript } from "@yuno-payments/sdk-web";

const PUBLIC_API_KEY = "test";
const CHECKOUT_SESSION = "";
const PAYMENT_METHOD_TYPE = "CARD";
const VAULTED_TOKEN = undefined;

export const startPayment = async () => {
  const yuno = await loadScript();
  const yunoInstance = await yuno.initialize(PUBLIC_API_KEY);

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
