/**
 * Orchestrates the VTEX-preflight + Yuno wallet flow (application layer):
 *
 *   preflight -> initialize SDK -> render wallet -> OTT
 *     -> /preflight/payments (createPaymentInAuth) -> deferred
 *
 * The payment is always created during the VTEX authorization phase, so the OTT
 * is only stored here; there is no payment to resume in the app.
 *
 * UI components consume this hook; they never touch the SDK or the API directly.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {createPreflightSession, createPreflightPayment} from '../api';
import {yunoService} from '../services/YunoService';
import {useYunoEvents} from './useYunoEvents';
import {useAppStateForeground} from './useAppStateForeground';
import {CHECKOUT, YUNO, ACTIVE_WALLET_TYPE} from '../config';
import {logger, mask} from '../utils/logger';
import type {OneTimeTokenInfo, YunoPaymentState} from '@yuno-payments/yuno-sdk-react-native';

export type CheckoutPhase =
  | 'idle'
  | 'creatingSession'
  | 'ready' // session created + SDK initialized; wallet can be shown
  | 'processingPayment' // OTT received, storing it for deferred creation
  | 'deferred' // OTT stored; payment will be created at VTEX authorization
  | 'done'
  | 'error';

export interface StartSessionParams {
  amount: number;
  orderFormId: string;
}

export interface CheckoutState {
  phase: CheckoutPhase;
  orderFormId: string | null;
  amount: number | null;
  checkoutSession: string | null;
  paymentStatus: string | null;
  errorMessage: string | null;
}

const INITIAL_STATE: CheckoutState = {
  phase: 'idle',
  orderFormId: null,
  amount: null,
  checkoutSession: null,
  paymentStatus: null,
  errorMessage: null,
};

export function useVtexWalletCheckout() {
  const [state, setState] = useState<CheckoutState>(INITIAL_STATE);

  const checkoutSessionRef = useRef<string | null>(null);
  const ottInfoRef = useRef<OneTimeTokenInfo | null>(null);
  const processingRef = useRef(false); // guards against duplicate OTT handling
  const abortRef = useRef<AbortController | null>(null);
  // The orderFormId + amount captured for THIS attempt; both preflight calls
  // must use identical values (connector fingerprint), so we hold them in refs.
  const orderFormIdRef = useRef<string | null>(null);
  const amountRef = useRef<number>(CHECKOUT.defaultAmount);

  const patch = useCallback((next: Partial<CheckoutState>) => {
    setState(prev => ({...prev, ...next}));
  }, []);

  /** Step 1-2: create the preflight session and initialize the SDK. */
  const startSession = useCallback(
    async ({amount, orderFormId}: StartSessionParams) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      processingRef.current = false;
      ottInfoRef.current = null;
      orderFormIdRef.current = orderFormId;
      amountRef.current = amount;

      patch({
        phase: 'creatingSession',
        orderFormId,
        amount,
        errorMessage: null,
        paymentStatus: null,
      });
      logger.info('flow: startSession', {
        orderFormId,
        amount,
        currency: CHECKOUT.currency,
        country: CHECKOUT.country,
        wallet: ACTIVE_WALLET_TYPE,
      });

      try {
        await yunoService.clearLastPaymentStatus().catch(() => undefined);
        await yunoService.clearLastOTT().catch(() => undefined);

        const session = await createPreflightSession(
          {
            orderFormId,
            amount,
            currency: CHECKOUT.currency,
            country: CHECKOUT.country,
            affiliationName: CHECKOUT.affiliationName,
          },
          controller.signal,
        );

        await yunoService.initialize({
          apiKey: session.publicApiKey,
          countryCode: YUNO.countryCode,
          language: YUNO.language,
        });

        checkoutSessionRef.current = session.checkoutSession;
        patch({phase: 'ready', checkoutSession: session.checkoutSession});
        logger.info('flow: ready (SDK initialized, payment methods can render)');
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        logger.error('flow: startSession failed', {message: (error as Error).message});
        patch({phase: 'error', errorMessage: (error as Error).message});
      }
    },
    [patch],
  );

  /** Step 3: present the wallet (full list path). Method must be selected first. */
  const presentWallet = useCallback(async () => {
    logger.info('flow: presentWallet (startPayment)');
    try {
      await yunoService.startPayment(false);
    } catch (error) {
      logger.error('flow: presentWallet failed', {message: (error as Error).message});
      patch({phase: 'error', errorMessage: (error as Error).message});
    }
  }, [patch]);

  /** Step 5: store the OTT via the connector; the payment is created at VTEX authorization. */
  const processToken = useCallback(
    async (token: string) => {
      if (processingRef.current) {
        return;
      }
      const checkoutSession = checkoutSessionRef.current;
      if (!checkoutSession) {
        return;
      }
      processingRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;
      patch({phase: 'processingPayment'});
      logger.info('flow: OTT received → storing for deferred creation', {
        token: mask(token),
        ottInfoType: ottInfoRef.current?.type ?? null,
      });

      try {
        const paymentMethodType = ottInfoRef.current?.type ?? ACTIVE_WALLET_TYPE;

        await createPreflightPayment(
          {
            orderFormId: orderFormIdRef.current ?? '',
            checkoutSession,
            oneTimeToken: token,
            paymentMethodType,
            amount: amountRef.current,
            currency: CHECKOUT.currency,
            country: CHECKOUT.country,
            affiliationName: CHECKOUT.affiliationName,
            createPaymentInAuth: true,
          },
          controller.signal,
        );

        // The payment is created during VTEX authorization, so there is nothing
        // for the SDK to continue — stop here.
        logger.info('flow: deferred — payment will be created at VTEX authorization');
        patch({phase: 'deferred'});
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        processingRef.current = false;
        logger.error('flow: processToken failed', {message: (error as Error).message});
        patch({phase: 'error', errorMessage: (error as Error).message});
      }
    },
    [patch],
  );

  // Live SDK events.
  useYunoEvents({
    onOTT: token => {
      void processToken(token);
    },
    onOTTInfo: info => {
      ottInfoRef.current = info;
      if (info?.token) {
        void processToken(info.token);
      }
    },
    onPaymentStatus: (status: YunoPaymentState) => {
      logger.info('flow: paymentStatus', {status: status.status});
      patch({
        phase: 'done',
        paymentStatus: status.status,
      });
    },
  });

  // Android safety net: recover the OTT if the event was missed while paused.
  useAppStateForeground({
    onForeground: () => {
      if (processingRef.current) {
        return;
      }
      void (async () => {
        const info = await yunoService.getLastOTTInfo().catch(() => null);
        if (info) {
          ottInfoRef.current = info;
        }
        const token = await yunoService.getLastOTT().catch(() => null);
        if (token) {
          void processToken(token);
        }
      })();
    },
  });

  const reset = useCallback(() => {
    abortRef.current?.abort();
    processingRef.current = false;
    ottInfoRef.current = null;
    checkoutSessionRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {state, startSession, presentWallet, reset};
}
