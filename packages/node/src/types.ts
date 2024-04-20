type Nullable<T extends {}> = {
  [K in keyof T]: T[K] | null;
};

type Document = {
  document_type: string;
  document_number: string;
};

type Phone = {
  number: string;
  country_code: string;
};

type BillingAddress = {
  address_line_1: string;
  address_line_2: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
};

type ShippingAddress = {
  address_line_1: string;
  address_line_2: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
};

type Customer = {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
};

export type CustomerInput = Customer & {
  merchant_customer_id?: string;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  document?: Partial<Document>;
  phone?: Partial<Phone>;
  billing_address?: Partial<BillingAddress>;
  shipping_address?: Partial<ShippingAddress>;
};

export type CustomerResponse = Customer & {
  id: string;
  merchant_customer_id: string;
  gender: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  document: Nullable<Document> | null;
  phone: Nullable<Phone> | null;
  billing_address: Nullable<BillingAddress> | null;
  shipping_address: Nullable<ShippingAddress> | null;
  created_at: string;
  updated_at: string;
};

type CheckoutSession = {
  customer_id: string;
  merchant_order_id: string;
  payment_description: string;
  country: string;
  amount: {
    currency: string;
    value: number;
  };
};

export type CheckoutSessionInput = CheckoutSession & {
  callback_url?: string;
  metadata?: any;
};

export type CheckoutSessionResponse = CheckoutSession & {
  callback_url: string | null;
  checkout_session: string;
  created_at: Date;
  metadata: any;
  workflow: string;
};

export type ApiKeys = {
  accountCode: string;
  publicApiKey: string;
  privateSecretKey: string;
};
