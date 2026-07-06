/**
 * Declaración de tipos para el Yuno SDK
 * Estos tipos deben coincidir con @yuno-payments/yuno-sdk-react-native
 */

declare module '@yuno-payments/yuno-sdk-react-native' {
  export interface YunoPaymentState {
    status: string;
    token?: string;
    type?: string;
    message?: string;
    [key: string]: any;
  }

  export interface YunoEnrollmentState {
    status: string;
    type?: string;
    message?: string;
    [key: string]: any;
  }

  export interface OneTimeTokenInfo {
    token?: string | null;
    vaultedToken?: string | null;
    vaultOnSuccess?: boolean | null;
    type?: string | null;
    cardData?: CardInformation | null;
    customer?: CustomerPayerInformation | null;
    [key: string]: any;
  }

  export interface CardInformation {
    holder_name?: string | null;
    iin?: string | null;
    lfd?: string | null;
    number_length?: number | null;
    security_code_length?: number | null;
    brand?: string | null;
    type?: string | null;
    category?: string | null;
    issuer_name?: string | null;
    issuer_code?: string | null;
    country_code?: string | null;
  }

  export interface CustomerPayerInformation {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    document?: {
      document_type?: string | null;
      document_number?: string | null;
    } | null;
    phone?: {
      country_code?: string | null;
      number?: string | null;
    } | null;
    billing_address?: {
      address_line_1?: string | null;
      address_line_2?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      zip_code?: string | null;
    } | null;
  }

  export enum YunoLanguage {
    EN = 'EN',
    ES = 'ES',
    PT = 'PT',
    ID = 'ID',
    MY = 'MY',
    MS = 'MS',
    FR = 'FR',
    PL = 'PL',
    IT = 'IT',
    DE = 'DE',
    RU = 'RU',
    TR = 'TR',
    NL = 'NL',
    SV = 'SV',
    TH = 'TH',
    FIL = 'FIL',
    VI = 'VI',
    ZH_CN = 'ZH-CN',
    ZH_TW = 'ZH-TW',
  }

  export enum CardFlow {
    ONE_STEP = 'ONE_STEP',
    STEP_BY_STEP = 'STEP_BY_STEP',
  }

  export enum YunoStatus {
    REJECTED = 'REJECTED',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
    PROCESSING = 'PROCESSING',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    CANCELLED_BY_USER = 'CANCELLED_BY_USER',
  }

  export enum CardType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
  }

  export interface Detail {
    expirationMonth?: number;
    expirationYear?: number;
    number?: string;
    securityCode?: string;
    holderName?: string;
    type?: CardType | string;
  }

  export interface CardData {
    save?: boolean;
    detail: Detail;
  }

  export interface PaymentMethod {
    type: string;
    vaultedToken?: string | null;
    card?: CardData;
  }

  export interface TokenCollectedData {
    checkoutSession?: string;
    customerSession?: string;
    paymentMethod: PaymentMethod;
  }

  export interface CardPaymentResult {
    paymentState: string;
    paymentSubState?: string | null;
  }

  export interface HeadlessTokenResponse {
    token?: string;
    error?: string;
  }

  export interface EnrollmentMethod {
    type: string;
    card: CardData;
  }

  export interface EnrollmentCollectedData {
    customerSession: string;
    paymentMethod: EnrollmentMethod;
  }

  export interface HeadlessEnrollmentResponse {
    vaultedToken?: string;
    error?: string;
  }

  export interface YunoConfig {
    language?: string;
    cardFlow?: CardFlow;
    saveCardEnabled?: boolean;
    keepLoader?: boolean;
    isDynamicViewEnabled?: boolean;
    cardFormDeployed?: boolean;
  }

  export interface EnrollmentArguments {
    customerSession: string;
    showPaymentStatus?: boolean;
    countryCode?: string;
  }

  export interface MethodSelected {
    vaultedToken: string;
    paymentMethodType: string;
  }

  export interface StartPayment {
    checkoutSession: string;
    methodSelected: MethodSelected;
    showPaymentStatus?: boolean;
  }

  export interface SeamlessArguments {
    checkoutSession: string;
    methodSelected: MethodSelected;
    showPaymentStatus?: boolean;
    countryCode?: string;
  }

  export interface PaymentMethodSelectedEvent {
    isSelected: boolean;
  }

  export interface PaymentMethodErrorEvent {
    message: string;
  }

  export class YunoSdk {
    static markAsInitialized(countryCode?: string, language?: YunoLanguage): void;
    static initialize(params: {
      apiKey: string;
      countryCode: string;
      yunoConfig?: YunoConfig;
      iosConfig?: any;
      androidConfig?: any;
    }): Promise<void>;
    static clearLastOneTimeToken(): Promise<void>;
    static clearLastPaymentStatus(): Promise<void>;
    static getLastOneTimeToken(): Promise<string | null>;
    static getLastOneTimeTokenInfo(): Promise<OneTimeTokenInfo | null>;
    static startPayment(showPaymentStatus?: boolean): Promise<void>;
    static startPaymentLite(
      params: StartPayment,
      countryCode?: string,
    ): Promise<void>;
    static enrollmentPayment(params: EnrollmentArguments): Promise<void>;
    static startPaymentSeamlessLite(params: SeamlessArguments): Promise<YunoStatus>;
    static continuePayment(
      checkoutSession: string,
      countryCode?: string,
      showPaymentStatus?: boolean,
    ): Promise<void>;
    static hideLoader(): Promise<void>;
    static receiveDeeplink(url: string): Promise<void>;
    static onPaymentStatus(listener: (state: YunoPaymentState) => void): { remove: () => void };
    static onEnrollmentStatus(listener: (state: YunoEnrollmentState) => void): { remove: () => void };
    static onOneTimeToken(listener: (token: string) => void): { remove: () => void };
    static onOneTimeTokenInfo(listener: (tokenInfo: OneTimeTokenInfo) => void): { remove: () => void };

    // Headless methods
    static generateToken(
      tokenCollectedData: TokenCollectedData,
      checkoutSession: string,
      countryCode?: string,
    ): Promise<HeadlessTokenResponse>;
    static continueCardPayment(
      checkoutSession: string,
      countryCode?: string,
      showPaymentStatus?: boolean,
    ): Promise<CardPaymentResult>;
    static continueEnrollment(
      enrollmentCollectedData: EnrollmentCollectedData,
      customerSession: string,
      countryCode?: string,
    ): Promise<HeadlessEnrollmentResponse>;
  }

  export const YunoPaymentMethods: React.FC<{
    checkoutSession: string;
    countryCode: string;
    onPaymentMethodSelected?: (event: PaymentMethodSelectedEvent) => void;
    onPaymentMethodError?: (event: PaymentMethodErrorEvent) => void;
    style?: any;
    testID?: string;
  }>;
}
