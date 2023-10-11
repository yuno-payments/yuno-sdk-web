"use server";

import { yunoClient } from "@/utils/yuno";
import type { CheckoutSessionInput, CustomerInput } from "@yuno-sdk-web/server";

export async function createYunoCustomer(customer: CustomerInput) {
  const customerResponse = await yunoClient.customers.create(customer);

  return customerResponse;
}

export async function createYunoCheckoutSession(
  checkout: CheckoutSessionInput,
) {
  const checkoutSessionResponse =
    await yunoClient.checkoutSessions.create(checkout);

    return checkoutSessionResponse;
}
