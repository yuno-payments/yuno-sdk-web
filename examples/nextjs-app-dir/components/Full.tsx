"use client";

import { createYunoCheckoutSession, createYunoCustomer } from "@/app/actions";
import { useYuno } from "@yuno-sdk-web/react";
import { useEffect } from "react";

export default function Full() {
  const yuno = useYuno();

  useEffect(() => {
    (async () => {
      if (yuno) {
        const customer = await createYunoCustomer({
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@y.uno",
          country: "CO",
        });
        const checkoutSession = await createYunoCheckoutSession({
          merchant_order_id: "order_123",
          customer_id: customer.id,
          payment_description: "test",
          country: "CO",
          amount: {
            currency: "COP",
            value: 20000,
          },
        });
        yuno.startCheckout({
          checkoutSession: checkoutSession.checkout_session,
          elementSelector: "#root-apm-yuno",
          countryCode: "CO",
          language: "es",
          onLoading: () => {},
          async yunoCreatePayment() {
            yuno.continuePayment();
          },
        });
        await yuno.mountCheckout({});
      }
    })();
  }, [yuno]);

  const startYunoPayment = () => {
    yuno?.startPayment();
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-y-4">
      <div id="root-apm-yuno" />
      <button
        id="button-pay"
        onClick={startYunoPayment}
        className="bg-white text-black rounded-md p-2"
      >
        Pagar
      </button>
    </div>
  );
}
