/**
 * Hand-written types for the Universal SDK (v2) Web bundle, covering only what
 * the examples in this folder use. They mirror sdk-web `etc/sdk-web-v2.api.md`.
 *
 * Interim: replace this file with the v2 types package once it is published
 * (tracked as UMJ-183). Until then, add a type here when an example needs it.
 */
export {}

declare global {
  interface Window {
    SdkPayments: SdkPaymentsStatic
  }
}

export interface SdkPaymentsStatic {
  initialize(publicApiKey: string): Promise<SdkPayments>
}

export interface SdkPayments {
  transaction(config: PaymentTransactionConfig): PaymentTransaction
  transaction(config: EnrollmentTransactionConfig): EnrollmentTransaction
}

/** ISO 3166-1 alpha-2, e.g. 'CO', 'BR', 'US'. */
export type CountryCode = string
/** 'en' | 'es' | 'pt' and the other languages the SDK ships. */
export type Language = string
/** Yuno payment method type, e.g. 'CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'PAYPAL', 'PIX'. */
export type PaymentMethodType = string

export interface TransactionStatus {
  status: string
  substatus: string | null
  message: { source: 'sdk' | 'backend'; code: string; reason?: string } | null
}

export interface SdkState {
  form: { isValid: boolean }
}

export interface OneTimeToken {
  /** The one-time token the merchant backend sends as payment_method.token. */
  token: string
  type?: PaymentMethodType
  checkout_session?: string
  [key: string]: unknown
}

interface TransactionConfigBase {
  countryCode: CountryCode
  language?: Language
  /** Where the SDK renders its UI. Required for UI scenarios; ignored by headless ones. */
  elementSelector?: string | HTMLElement
  /** Let the SDK show its own success / failure screen at the end. */
  showStatusScreen?: boolean
  onStatus?: (status: TransactionStatus) => void
  /** Fires on every validity change of the mounted form. */
  onChange?: (state: SdkState) => void
  /** Replaces the SDK's full-screen loader with your own indicator. */
  showLoading?: (isLoading: boolean) => void
}

export interface PaymentTransactionConfig extends TransactionConfigBase {
  checkoutSession: string
  customerSession?: never
  /**
   * Manual mode. When present the SDK hands you the one-time token instead of
   * creating the payment itself; create it from your backend, then resolve.
   */
  createPayment?: (token: OneTimeToken) => void | Promise<void>
  /** Hide the SDK pay button and submit the form yourself with transaction.submit(). */
  showPayButton?: boolean
  /** Default true. false stops the SDK after createPayment resolves. */
  autoContinuePayment?: boolean
}

export interface EnrollmentTransactionConfig extends TransactionConfigBase {
  customerSession: string
  checkoutSession?: never
}

export interface CardData {
  number: string
  expirationMonth: number
  expirationYear: number
  securityCode: string
  holderName: string
}

export interface StartPaymentMethod {
  type: PaymentMethodType
  vaultedToken?: string
  /** Headless: pass the data instead of rendering a form. */
  data?: { card?: Partial<CardData>; vaultOnSuccess?: boolean }
}

export interface PaymentMethodSelected {
  type: PaymentMethodType
  name?: string
  vaultedToken?: string
  /** 'user' when the shopper tapped it; 'auto' when the SDK preselected it. */
  selectionSource?: 'auto' | 'user'
}

export interface MountOptions {
  elementSelector: string
  [option: string]: unknown
}

export interface View {
  mount(options: MountOptions): void
}

export interface PaymentMethodsViews {
  applePay?: View
  googlePay?: View
  paypal?: View
  samsungPay?: View
  revolutPay?: View
  paymentMethodList?: View
}

export type PaymentMethodViewType = keyof PaymentMethodsViews

export interface SecureField {
  mount(selector: string): void
}

export interface SecureFieldsInstance {
  create(args: { name: 'pan' | 'expiration' | 'cvv'; options?: { label?: string; placeholder?: string } }): SecureField
}

interface TransactionBase {
  /** Single-shot: a second call throws. */
  start(args?: { paymentMethod?: StartPaymentMethod }): Promise<void>
  unmount(): Promise<void>
}

export interface PaymentTransaction extends TransactionBase {
  getPaymentMethodsViews(options: {
    types: readonly PaymentMethodViewType[]
    onPaymentSelected?: (paymentMethod: PaymentMethodSelected) => void
  }): PaymentMethodsViews
  secureFields(): Promise<SecureFieldsInstance>
  /** Submits the mounted form when showPayButton is false. */
  submit(): void
}

export type EnrollmentTransaction = TransactionBase
