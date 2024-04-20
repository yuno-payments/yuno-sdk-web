import { useYuno } from "@yuno-sdk-web/react";

import { useEffect } from "react";

export default function Full() {
  const yuno = useYuno();

  useEffect(() => {
    void (async () => {
      if (yuno) {
        const customer = (await fetch("http://localhost:3000/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@y.uno",
            country: "CO",
          }),
        }).then((res) => res.json())) as { id: string };
        const checkoutSession = (await fetch(
          "http://localhost:3000/checkout/sessions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              merchant_order_id: "order_123",
              customer_id: customer.id,
              payment_description: "test",
              country: "CO",
              amount: {
                currency: "COP",
                value: 20000,
              },
            }),
          },
        ).then((res) => res.json())) as { checkout_session: string };
        await yuno.startCheckout({
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
    <div className="flex flex-col w-screen h-screen justify-center items-center">
      <div id="root-apm-yuno"></div>
      <button id="button-pay" onClick={startYunoPayment}>
        Pagar Ahora
      </button>
    </div>
  );
}
