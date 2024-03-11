type Installment = {
  installmentId: string;
  installment: number;
  amount: {
    currency: string;
    value: string;
    total_value: string;
  };
};

type GetElement = {
  name: Name;
};

type OnChangeArgs = {
  error: boolean;
  data?: {
    installments?: Installment[];
  };
};

type SecureField = {
  render(elementSelector: string): Promise<void>;
  focus(): void;
  unmountSync(): void;
};

type Name = "cvv" | "pan" | "expiration";

type Create = {
  name: Name;
  options: {
    label?: string;
    showError?: boolean;
    onChange?(onChangeArgs: OnChangeArgs): void;
    onBlur?(): void;
    onFocus?(): void;
    styles?: string;
    placeholder: string;
  };
};

type GenerateTokenArgs = {
  cardHolderName: string;
  saveCard?: boolean;
  customer?: Partial<Customer>;
};
type GenerateVaultedToken = {
  cardHolderName: string;
  customer?: Partial<Customer>;
};

type VaultedToken = {
  code: string;
  idempotency_key: string;
  organization_code: string;
  account_code: string;
  customer_session: string;
  name: string;
  description: string;
  status: Status;
  type: string;
  category: string;
  provider: {
    type: string;
    action: string;
    token: string;
    enrollment_id: string | null;
    provider_status: string | null;
    redirect: string | null;
    raw_response: unknown;
  };
  created_at: Date;
  updated_at: Date;
};

type SecureFields = {
  create({ name, options }: Create): SecureField;
  getElement({ name }: GetElement): SecureField;
  generateToken(params: GenerateTokenArgs): Promise<string>;
  generateTokenWithInformation(
    params: GenerateTokenArgs,
  ): Promise<OneTimeToken>;
  generateVaultedToken(params: GenerateVaultedToken): Promise<string>;
  generateVaultedTokenWithInformation(
    params: GenerateVaultedToken,
  ): Promise<VaultedToken>;
  unmountSync(): void;
};

export type SecureFieldsArgs = {
  countryCode: string;
  checkoutSession?: string;
  installmentEnable?: boolean;
  customerSession?: string;
};

export type mountFraudArgs = Pick<
  YunoConfig,
  "yunoCreatePayment" | "yunoError" | "language" | "checkoutSession"
>;

export type MountEnrollmentLiteArgs = Pick<
  YunoConfig,
  | "language"
  | "countryCode"
  | "renderMode"
  | "yunoEnrollmentStatus"
  | "yunoError"
  | "showLoading"
  | "onRendered"
  | "onOneTimeTokenCreationStart"
  | "onLoading"
>;

export type LoadingType = "DOCUMENT" | "ONE_TIME_TOKEN";

type EnrollmentStatus =
  | "CREATED"
  | "EXPIRED"
  | "REJECTED"
  | "READY_TO_ENROLL"
  | "ENROLL_IN_PROCESS"
  | "UNENROLL_IN_PROCESS"
  | "ENROLLED"
  | "DECLINED"
  | "CANCELED"
  | "ERROR"
  | "UNENROLLED";

type Status = "FAIL" | "REJECT" | "SUCCEEDED" | "PROCESSING" | "READY";

type Customer = {
  first_name: string;
  last_name: string;
  email: string;
  gender?: string;
  device_fingerprint?: string | null;
  third_party_session_id?: string | null;
  document: {
    document_number: string;
    document_type: string;
  };
  phone: {
    country_code: string;
    number: string;
  };
  billing_address: {
    address_line_1: string;
    address_line_2: string;
    city: string;
    country: string;
    state: string;
    zip_code: string;
  };
  shipping_address: {
    address_line_1: string;
    address_line_2: string;
    country: string;
    state: string;
    city: string;
    zip_code: string;
  };
  browser_info?: Partial<{
    accept_browser: string | null;
    accept_content: string | null;
    accept_header: string | null;
    color_depth: string | null;
    javascript_enabled: boolean | null;
    language: string | null;
    screen_height: string | null;
    screen_width: string | null;
    user_agent: string | null;
    java_enabled: boolean | null;
    browser_time_difference: string | null;
  }>;
  merchant_customer_id?: string;
};

type OneTimeToken = {
  token: string;
  vaulted_token: string | null;
  vault_on_success: boolean;
  type: string;
  card_data?: {
    holder_name: string;
    iin: string;
    lfd: string;
    number_length: number;
    security_code_length: number;
    brand: string;
    issuer_name: string;
    issuer_code: string | null;
    category: string | null;
    type: string;
  };
  customer: Customer;
};

export type TextsCustom = {
  customerForm?: {
    submitButton?: string;
  };
  paymentOtp?: {
    sendOtpButton?: string;
  };
};

export type ButtonTextCard = {
  cardForm?: {
    enrollmentSubmitButton?: string;
    paymentSubmitButton?: string;
  };
  cardStepper?: {
    numberCardStep?: {
      nextButton?: string;
    };
    cardHolderNameStep?: {
      prevButton?: string;
      nextButton?: string;
    };
    expirationDateStep?: {
      prevButton?: string;
      nextButton?: string;
    };
    cvvStep?: {
      prevButton?: string;
      nextButton?: string;
    };
  };
};

type CardConfig = {
  styles?: string;
  type?: "extends" | "step";
  cardSaveEnable?: boolean;
  texts?: ButtonTextCard;
  documentEnable?: boolean;
};

export declare enum ExternalPaymentButtonsTypes {
  PAYPAL = "paypal",
}

export type ExternalPaymentButtons = {
  [key in ExternalPaymentButtonsTypes]: {
    elementSelector: string;
  };
};

export type RenderMode = {
  type: "modal" | "element";
  elementSelector?: string;
};

export type Language = "es" | "en" | "pt";

export type MountCheckoutLiteArgs = {
  paymentMethodType?: string;
  vaultedToken?: string;
};

export type MountCheckoutArgs = {
  paymentMethodType?: string;
  vaultedToken?: string;
  category?: string;
};

export type YunoConfig = {
  publicApiKey: string;
  checkoutSession: string;
  customerSession: string;
  language: Language;
  countryCode: string;
  elementSelector?: string;
  vaultedToken?: string;
  type?: string;
  renderMode?: RenderMode;
  externalPaymentButtons?: ExternalPaymentButtons;
  card?: CardConfig;
  showLoading?: boolean;
  texts?: TextsCustom;
  issuersFormEnable?: boolean;
  automaticallyUnmount?: boolean;
  cardFormUnfoldedEnable?: boolean;
  isDynamicViewEnabled?: boolean;
  showOnlyThesePaymentMethods?: string[];
  yunoCreatePayment?: (
    oneTimeToken: string,
    tokenWithInformation: OneTimeToken,
  ) => void;
  yunoPaymentMethodSelected?: (arg: { type: string; name: string }) => void;
  yunoPaymentResult?: (status: Status) => void;
  yunoError?: (message: string) => void;
  onRendered?(): void;
  onOneTimeTokenCreationStart?(): void;
  yunoEnrollmentStatus?(params: {
    status: EnrollmentStatus;
    vaultedToken?: string;
  }): void;
  /**
   * @deprecated
   */
  onLoading?(args: { isLoading: boolean; type: LoadingType }): void;
};

export type StartCheckoutArgs = Omit<
  YunoConfig,
  "yunoEnrollmentStatus" | "customerSession" | "publicApiKey"
>;

export type YunoInstance = {
  startCheckout(args: StartCheckoutArgs): void;
  mountCheckout(args: MountCheckoutArgs): void;
  mountCheckoutLite(args: MountCheckoutLiteArgs): void;
  updateCheckoutSession(checkout: string): void;
  startPayment(): void;
  continuePayment(): Promise<void>;
  notifyError(): void;
  mountEnrollmentLite(args: MountEnrollmentLiteArgs): void;
  showLoader(): void;
  hideLoader(): void;
  updateCheckoutSession(checkoutSession: string): void;
  mountFraud(args: mountFraudArgs): void;
  secureFields({
    countryCode,
    checkoutSession,
    installmentEnable,
    customerSession,
  }: SecureFieldsArgs): SecureFields;
};

export type Yuno = {
  initialize(publicApiKey: string): YunoInstance;
};
