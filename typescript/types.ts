interface Customer {
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
}

type Status = 'FAIL' | 'REJECT' | 'SUCCEEDED' | 'PROCESSING' | 'READY';
type EnrollmentStatus = 'CREATED' | 'EXPIRED' | 'REJECTED' | 'READY_TO_ENROLL' | 'ENROLL_IN_PROCESS' | 'UNENROLL_IN_PROCESS' | 'ENROLLED' | 'DECLINED' | 'CANCELED' | 'ERROR' | 'UNENROLLED';

type Name = 'cvv' | 'pan' | 'expiration';
type Installment = {
  installmentId: string;
  installment: number;
  amount: {
    currency: string;
    value: string;
    total_value: string;
  };
};

interface CardIINResponse {
  id: string;
  iin: string;
  scheme: string;
  issuer_name: string;
  issuer_code: string;
  brand: string;
  type: string;
  category: string;
  country_code: string;
  country_name: string;
  website: string;
  phone: {
      country_code: string;
      number: string;
  };
  address: {
      address_line_1: string;
      address_line_2: string | null;
      city: string;
      country: string;
      state: string;
      zip_code: string;
  };
}

type OnChangeArgs = {
  error: boolean;
  data?: {
    installments?: Installment[];
    cardIIN?: CardIINResponse;
    isCardIINLoading: boolean;
    isInstallmentLoading: boolean;
  };
};
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
type GetElement = {
  name: Name;
};
interface GenerateTokenArgs {
  checkoutSession?: string;
  cardHolderName: string;
  saveCard?: boolean;
  customer?: Partial<Customer>;
  installment?: {
    id: string;
    value: number;
    amount?: {
      currency: string;
      value: string;
      total_value: string;
    };
  }
  cardType?: string;
}
interface GenerateVaultedToken {
  cardHolderName: string;
  customer?: Partial<Customer>;
}
interface OneTimeToken {
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
}
interface VaultedToken {
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
}

type CardType = 'CREDIT' | 'DEBIT'

interface SecureField {
  render(elementSelector: string): Promise<void>;
  focus(): void;
  validate(): void;
  unmountSync(): void;
  clearValue(): void;
  setError(errorMessage: string): void
  setCardType(cardType: CardType): void
}
interface SecureFields {
  create({ name, options }: Create): SecureField;
  getElement({ name }: GetElement): SecureField;
  generateToken(params: GenerateTokenArgs): Promise<string>;
  generateTokenWithInformation(params: GenerateTokenArgs): Promise<OneTimeToken>;
  generateVaultedToken(params: GenerateVaultedToken): Promise<string>;
  generateVaultedTokenWithInformation(params: GenerateVaultedToken): Promise<VaultedToken>;
  unmountSync(): void;
}

interface ButtonTextCard {
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
}
interface TextsCustom {
  customerForm?: {
    submitButton?: string;
  };
  paymentOtp?: {
    sendOtpButton?: string;
  };
}
interface CardConfig {
  styles?: string;
  type?: 'extends' | 'step';
  cardSaveEnable?: boolean;
  texts?: ButtonTextCard;
  documentEnable?: boolean;
}
interface RenderMode {
  type: 'modal' | 'element';
  elementSelector?: string;
}
declare enum ExternalPaymentButtonsTypes {
  PAYPAL = "paypal"
}
type ExternalPaymentButtons = {
  [key in ExternalPaymentButtonsTypes]: {
    elementSelector: string;
  };
};
type LoadingType = 'DOCUMENT' | 'ONE_TIME_TOKEN';
type Language = 'es' | 'en' | 'pt';
interface YunoConfig {
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
  yunoCreatePayment?: (oneTimeToken: string, tokenWithInformation: OneTimeToken) => void;
  yunoPaymentMethodSelected?: (arg: {
    type: string;
    name: string;
  }) => void;
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
  onLoading?(args: {
    isLoading: boolean;
    type: LoadingType;
  }): void;
}
type StartCheckoutArgs = Omit<YunoConfig, 'yunoEnrollmentStatus' | 'customerSession' | 'publicApiKey'>;
type MountEnrollmentLiteArgs = Pick<YunoConfig, 'language' | 'countryCode' | 'renderMode' | 'yunoEnrollmentStatus' | 'yunoError' | 'showLoading' | 'onRendered' | 'onOneTimeTokenCreationStart' | 'onLoading'>;
type mountFraudArgs = Pick<YunoConfig, 'yunoCreatePayment' | 'yunoError' | 'language' | 'checkoutSession'>;
interface MountCheckoutArgs {
  paymentMethodType?: string;
  vaultedToken?: string;
  category?: string;
}
interface MountCheckoutLiteArgs {
  paymentMethodType?: string;
  vaultedToken?: string;
}
interface SecureFieldsArgs {
  countryCode: string;
  checkoutSession?: string;
  installmentEnable?: boolean;
  customerSession?: string;
}

type YunoInstance = {
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
  secureFields({ countryCode, checkoutSession, installmentEnable, customerSession }: SecureFieldsArgs): SecureFields;
}

interface Yuno {
  initialize(publicApiKey: string): YunoInstance;
}

export { type ButtonTextCard, type CardConfig, type ExternalPaymentButtons, ExternalPaymentButtonsTypes, type Language, type LoadingType, type MountCheckoutArgs, type MountCheckoutLiteArgs, type MountEnrollmentLiteArgs, type RenderMode, type SecureFieldsArgs, type StartCheckoutArgs, type TextsCustom, type Yuno, type YunoConfig, type mountFraudArgs };

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Yuno: Yuno
  }
}
