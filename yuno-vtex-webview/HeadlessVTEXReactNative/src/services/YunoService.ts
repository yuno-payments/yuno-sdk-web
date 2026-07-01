/**
 * Thin wrapper over the Yuno RN SDK (infrastructure layer).
 * Only the operations the wallet preflight flow needs are exposed.
 */

import {YunoSdk} from '@yuno-payments/yuno-sdk-react-native';
import type {OneTimeTokenInfo} from '@yuno-payments/yuno-sdk-react-native';
import {logger, mask} from '../utils/logger';

export interface InitParams {
  apiKey: string;
  countryCode: string;
  language?: string;
}

class YunoService {
  /** Initialize the SDK with the public API key returned by preflight. */
  async initialize(params: InitParams): Promise<void> {
    logger.info('sdk: initialize', {
      countryCode: params.countryCode,
      language: params.language,
      apiKey: mask(params.apiKey),
    });
    await YunoSdk.initialize({
      apiKey: params.apiKey,
      countryCode: params.countryCode,
      yunoConfig: {
        language: params.language ?? 'en',
        saveCardEnabled: false,
        // keepLoader=false lets the SDK hide its loader between steps; we drive
        // status via events.
        keepLoader: false,
      },
    });
  }

  /**
   * Start the full payment UI. A payment method must already be selected in the
   * mounted <YunoPaymentMethods> list. Presents the wallet sheet; the OTT then
   * arrives via the YunoOneTimeToken event.
   */
  async startPayment(showPaymentStatus = false): Promise<void> {
    logger.info('sdk: startPayment', {showPaymentStatus});
    await YunoSdk.startPayment(showPaymentStatus);
  }

  /**
   * Wallet-only entry point (Step B): goes straight to a pre-selected method
   * without rendering the full list. Depends on the exact wallet type string.
   */
  async startPaymentLite(params: {
    checkoutSession: string;
    paymentMethodType: string;
    countryCode: string;
    showPaymentStatus?: boolean;
  }): Promise<void> {
    await YunoSdk.startPaymentLite(
      {
        checkoutSession: params.checkoutSession,
        // vaultedToken is not required for wallets; the SDK treats it optional.
        methodSelected: {paymentMethodType: params.paymentMethodType} as never,
        showPaymentStatus: params.showPaymentStatus ?? false,
      },
      params.countryCode,
    );
  }

  /** Resume the SDK after the payment was created server-side (settles / renders result). */
  async continuePayment(
    checkoutSession: string,
    countryCode: string,
    showPaymentStatus = false,
  ): Promise<void> {
    logger.info('sdk: continuePayment', {checkoutSession, countryCode});
    await YunoSdk.continuePayment(checkoutSession, countryCode, showPaymentStatus);
  }

  /** Safety net for Android, where RN may be paused while the wallet UI is up. */
  async getLastOTT(): Promise<string | null> {
    return YunoSdk.getLastOneTimeToken();
  }

  async getLastOTTInfo(): Promise<OneTimeTokenInfo | null> {
    return YunoSdk.getLastOneTimeTokenInfo();
  }

  async clearLastOTT(): Promise<void> {
    await YunoSdk.clearLastOneTimeToken();
  }

  async clearLastPaymentStatus(): Promise<void> {
    await YunoSdk.clearLastPaymentStatus();
  }
}

export const yunoService = new YunoService();
