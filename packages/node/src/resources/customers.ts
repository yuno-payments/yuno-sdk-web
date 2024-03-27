import { nanoid } from "nanoid";
import { requestHandler } from "../internal/request-handler";
import { ApiKeys, CustomerInput, CustomerResponse } from "../types";

type CustomerConfig = {
  apiKeys: ApiKeys;
};

export function handleCustomerMethods(config: CustomerConfig) {
  return {
    create: createCustomer(config.apiKeys),
  };
}

/**
 * @param {string} merchant_customer_id - Optional parameter, if you don't pass a value Yuno will generate one for you
 */
function createCustomer(apiKeys: ApiKeys) {
  return async function createCustomerInner(customer: CustomerInput) {
    const body = {
      ...customer,
      merchant_customer_id: customer.merchant_customer_id ?? nanoid(),
    };

    return await requestHandler<CustomerResponse>({
      path: "/v1/customers",
      method: "POST",
      apiKeys,
      body,
    });
  };
}
