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
  /**
   * Returns whether input has error or not.
   * @type {Boolean}
   */
  error: boolean;
  /**
   * Returns card's configuration.
   * @optional
   */
  data?: {
    /**
     * Returns card's installments if it's a credit card.
     * @type {Installment[]}
     * @optional
     */
    installments?: Installment[];
    /**
     * Returns card's data.
     * @type {CardIINResponse}
     * @optional
     */
    cardIIN?: CardIINResponse;
    /**
     * Returns whether card's data is loading or not.
     * @type {Boolean}
     */
    isCardIINLoading: boolean;
    /**
     * Returns whether card's installments is loading or not.
     * @type {Boolean}
     */
    isInstallmentLoading: boolean;
  };
  /**
   * return input's value.
   * @type {String}
   * @optional
   */
  value?: string;
  /**
   * return whether input is dirty or not.
   * @type {Boolean}
   * @optional
   */
  isDirty?: boolean;
};
type Create = {
  /**
   * Secure field's name.
   * The available names are `pan`, `expiration` or `cvv`.
   */
  name: Name;
  /**
   * Secure field's options.
   */
  options: {
    /**
     * Field visible label.
     * @type {String}
     * @optional
     */
    label?: string;
    /**
     * Defines whether field error will be shown or not.
     * @type {Boolean}
     * @optional
     */
    showError?: boolean;
    /**
     * An auxiliary function that can be configured and will run when the field content changes.
     * Indicates if the fields have errors, additional data, value or if the field is dirty.
     * @param onChangeArgs
     * @optional
     */
    onChange?(onChangeArgs: OnChangeArgs): void;
    /**
     * Triggered when field focus is lost.
     * @optional
     */
    onBlur?(): void;
    /**
     * Change the validation behavior, improving the user experience by providing validation feedback after the field loses focus.
     * @type {Boolean}
     * @default false
     * @optional
     */
    validateOnBlur?: boolean;
    /**
     * Triggered when field is focused.
     * @optional
     */
    onFocus?(): void;
    /**
     * Additional CSS styles for the current field.
     * @type {String}
     * @optional
     */
    styles?: string;
    /**
     * Field placeholder.
     * @type {String}
     */
    placeholder: string;
    /**
     * Once secure field is rendered this function will be triggered.
     * @optional
     */
    onRenderedSecureField?(): void;
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
  installment?: {
    id: string,
    value: number,
    rate: number,
    amount: {
        currency: string,
        value: number,
        total_value: number,
    },
    installment_selected_id: string | null
  };
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
type SecureFields = {
  /**
   * Creates a secure field.
   * @param args 
   */
  create(args: Create): SecureField;
  /**
   * Get secure field by name.
   * @param args 
   */
  getElement(args: GetElement): SecureField;
  /**
   * Creates `One Time Token`.
   * @param args 
   */
  generateToken(args: GenerateTokenArgs): Promise<string>;
  /**
   * Create `One Time Token` with more information.
   * @param args 
   */
  generateTokenWithInformation(args: GenerateTokenArgs): Promise<OneTimeToken>;
  /**
   * Create `Vaulted Token`
   * @param args
   */
  generateVaultedToken(args: GenerateVaultedToken): Promise<string>;
  /**
   * Create `Vaulted Token` with more information
   * @param args
   */
  generateVaultedTokenWithInformation(args: GenerateVaultedToken): Promise<VaultedToken>;
  /**
   * Will unmount secure fields.
   */
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
type CardConfig = {
  styles?: string;
  /**
   * `step` or `extends`
   */
  type?: 'extends' | 'step';
  /**
   * Show checkbox for save/enroll card. Default value is `false`.
   */
  cardSaveEnable?: boolean;
  /**
   * Custom texts in Card forms buttons.
   */
  texts?: ButtonTextCard;
  /**
   * Hide or show the document fields into card form.
   * @default true
   * @optional
   */
  documentEnable?: boolean;
}
type RenderMode = {
  /**
   * can be either `modal` or `element`
   */
  type: 'modal' | 'element';
  /**
   * Element where the form will be rendered.
   * Only needed if type is element.
   */
  elementSelector?: string;
}
type LoadingType = 'DOCUMENT' | 'ONE_TIME_TOKEN';
type Language = 'es' | 'en' | 'pt';
type YunoConfig = {
  /**
   * Check the {@link https://docs.y.uno/reference/get-your-api-credentials | Get your API credentials} guide.
   * @type {String}
   */
  publicApiKey: string;
  /**
   * Refers to the current payment's checkout session.
   * @example `438413b7-4921-41e4-b8f3-28a5a0141638`
   * @type {String}
   */
  checkoutSession: string;
  /**
   * @type {String}
   */
  customerSession: string;
  /**
   * Defines the language to be used in the payment forms.
   * You can set it to one of the available language options:
   * es (Spanish), en (English), or pt (Portuguese).
   * @type {Language}
   */
  language: Language;
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: string;
  /**
   * Specifies the HTML element where you want to mount the Yuno SDK.
   * The SDK will be rendered within this element.
   * @type {String}
   * @optional
   */
  elementSelector?: string;
  /**
   * Vaulted token related to payment method type.
   * @type {String}
   * @optional
   */
  vaultedToken?: string;
  /**
   * Payment method type
   * @type {String}
   * @optional
   */
  type?: string;
  /**
   * Determine the mode in which the payment forms will be displayed.
   * @type {RenderMode}
   * @optional
   */
  renderMode?: RenderMode;
  /**
   * Define specific settings for the credit card form.
   * @optional
   */
  card?: CardConfig;
  /**
   * Control the visibility of the Yuno loading/spinner page during the payment process.
   * @default true
   * @optional
   */
  showLoading?: boolean;
  /**
   * Provide custom texts for payment form buttons to match your application's language or branding.
   * @optional
   */
  texts?: TextsCustom;
  /**
   * Enables the issuer's form (Bank list).
   */
  issuersFormEnable?: boolean;
  /**
   * Show card form unfolded on payment methods list.
   * @type {Boolean}
   * @optional
   */
  cardFormUnfoldedEnable?: boolean;
  /**
   * Callback called when One Time Token is created.
   * Merchant should create payment on the server.
   * @param { String } oneTimeToken 
   * @param { OneTimeToken } tokenWithInformation 
   * @returns void
   */
  yunoCreatePayment?: (oneTimeToken: string, tokenWithInformation: OneTimeToken) => void;
  /**
   * Callback is called when user selects a payment method.
   * @param {{ type: string, name: string }} args 
   * @optional
   */
  yunoPaymentMethodSelected?: (args: {
      type: string;
      name: string;
  }) => void;
  /**
   * After the payment is done, this function will be called with the payment status .
   * @param {Status} status
   * @optional
   */
  yunoPaymentResult?: (status: Status) => void;
  /**
   * If this is called the SDK should be mounted again
   * @param {String} message
   * @param {String?} data
   * @optional
   */
  yunoError?: (message: string, data?: string) => void;
  /**
   * @optional
   */
  onRendered?(): void;
  /**
   * Called before One Time Token is created.
   * @optional
   */
  onOneTimeTokenCreationStart?(): void;
  /**
   * callback called after the enrollment process has ended.
   * @param {{ status: EnrollmentStatus, vaultedToken?: string }} args
   */
  yunoEnrollmentStatus?(args: {
    status: EnrollmentStatus;
    vaultedToken?: string;
  }): void;
  /**
   * Required to receive notifications about server calls or loading events during the payment process.
   * @param {{ isLoading: boolean, type: LoadingType }} args
   */
  onLoading?(args: {
    isLoading: boolean;
    type: LoadingType;
  }): void;
  /**
   * Will enable our new design
   * @type {Boolean}
   * @optional
   */
  enableRedesign?: boolean;
  /**
   * Will show the payment status.
   * @type {Boolean}
   * @optional
   */
  showPaymentStatus?: boolean;
  /**
   * Will automatically unmount.
   * @type {Boolean}
   * @optional
   */
  automaticallyUnmount?: boolean;
}

type StartCheckoutArgs = Pick<YunoConfig,
    | 'elementSelector'
    | 'checkoutSession'
    | 'language'
    | 'countryCode'
    | 'renderMode'
    | 'yunoCreatePayment'
    | 'yunoPaymentMethodSelected'
    | 'yunoPaymentResult'
    | 'yunoError'
    | 'card'
    | 'showLoading'
    | 'onLoading'
    | 'texts'
    | 'issuersFormEnable'
    | 'enableRedesign'
    | 'showPaymentStatus'
    | 'automaticallyUnmount'
    | 'onOneTimeTokenCreationStart'

>

type MountCheckoutArgs = {
  /**
   * Select payment method by default.
   * @type {String?}
   * @optional
   */
  paymentMethodType?: string;
  /**
   * Vaulted token related to payment method type.
   * @type {String?}
   * @optional
   */
  vaultedToken?: string;
  /**
   * Payment method category.
   * @type {string?}
   * @optional
   */
  category?: string;
}

type MountCheckoutLiteArgs = {
  /**
   * Select payment method by default.
   * @type {String?}
   * @optional
   */
  paymentMethodType?: string;
  /**
   * Vaulted token related to payment method type.
   * @type {String?}
   * @optional
   */
  vaultedToken?: string;
}

type MountEnrollmentLiteArgs = Pick<YunoConfig, 'language' | 'countryCode' | 'renderMode' | 'yunoEnrollmentStatus' | 'yunoError' | 'showLoading' | 'onRendered' | 'onOneTimeTokenCreationStart' | 'onLoading'>;

type mountFraudArgs = Pick<YunoConfig, 'yunoCreatePayment' | 'yunoError' | 'language' | 'checkoutSession'>;

type MountStatusPaymentArgs = Pick<YunoConfig, 'checkoutSession' | 'language' | 'countryCode' | 'yunoPaymentResult' | 'yunoError'>

type SecureFieldsArgs = {
  /**
   * This parameter determines the country for which the payment process is being configured.
   * The complete list of supported countries and their country code is available on the
   * {@link https://docs.y.uno/docs/country-coverage-yuno-sdk | Country coverage} page.
   * @type {String}
   */
  countryCode: string;
  /**
   * Refers to the current payment's checkout session.
   * @example `438413b7-4921-41e4-b8f3-28a5a0141638`
   * @type {String}
   * @optional
   */
  checkoutSession?: string;
  /**
   * Will show installments.
   * @default false
   * @type {boolean}
   * @optional
   */
  installmentEnable?: boolean;
  customerSession?: string;
  /**
   * Defines the language to be used in the payment forms.
   * You can set it to one of the available language options:
   * es (Spanish), en (English), or pt (Portuguese).
   * @type {Language}
   * @optional
   */
  language?: Language;
  /**
   * Will enable secure field V2.
   * @type {Boolean}
   * @optional
   */
  enableV2?: boolean;
}

type YunoInstance = {
  /**
   * Will start the checkout process.
   * @param {StartCheckoutArgs} args
   */
  startCheckout(args: StartCheckoutArgs): void;
  /**
   * Display payment methods.
   * @param {MountCheckoutArgs} args
   */
  mountCheckout(args: MountCheckoutArgs): void;
  /**
   * Display payment methods.
   * @param {MountCheckoutLiteArgs} args
   */
  mountCheckoutLite(args: MountCheckoutLiteArgs): void;
  /**
   * Update checkout session.
   * @param checkout cehckout Refers to the current payment's checkout session. 
   */
  updateCheckoutSession(checkout: string): void;
  /**
   * Start the payment flow after the user has selected a payment method.
   */
  startPayment(): void;
  /**
   * Call only if the SDK needs to continue the payment flow
   * @param {{ showPaymentStatus: boolean }} args
   */
  continuePayment(args: { showPaymentStatus: boolean }): Promise<void>;
  notifyError(): void;
  /**
   * @param {MountEnrollmentLiteArgs} args 
   */
  mountEnrollmentLite(args: MountEnrollmentLiteArgs): void;
  /**
   * Will show loader.
   */
  showLoader(): void;
  /**
   * Will hide loader.
   */
  hideLoader(): void;
  /**
   * @param {mountFraudArgs} args
   */
  mountFraud(args: mountFraudArgs): void;
  /**
   * Will render payment status.
   * @param {MountStatusPaymentArgs} args
   */
  mountStatusPayment(args: MountStatusPaymentArgs): void;
  /**
   * Wil return payment status. This function wont render anything.
   * @type {Status}
   */
  yunoPaymentResult(): Status;
  /**
   * Will create `secure fields` instance
   * @param {SecureFieldsArgs} args 
   */
  secureFields({ countryCode, checkoutSession, installmentEnable, customerSession }: SecureFieldsArgs): SecureFields;
}

interface Yuno {
  /**
   * Create an instance of the `Yuno` class by providing a valid **PUBLIC_API_KEY**.
   * @param publicApiKey Check the {@link https://docs.y.uno/reference/get-your-api-credentials | Get your API credentials} guide.
   */
  initialize(publicApiKey: string): YunoInstance;
}

export { type ButtonTextCard, type CardConfig, type Language, type LoadingType, type MountCheckoutArgs, type MountCheckoutLiteArgs, type MountEnrollmentLiteArgs, type RenderMode, type SecureFieldsArgs, type StartCheckoutArgs, type TextsCustom, type Yuno, type YunoConfig, type mountFraudArgs };

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Yuno: Yuno
  }
}
