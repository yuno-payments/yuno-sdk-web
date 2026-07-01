/**
 * Subscribes to the Yuno SDK native events and forwards them to callbacks.
 * Logs each event (masked) through the shared demo logger.
 */

import {useEffect, useRef} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import {logger, mask} from '../utils/logger';
import type {
  YunoPaymentState,
  YunoEnrollmentState,
  OneTimeTokenInfo,
} from '../types';

function getYunoEventEmitter(): NativeEventEmitter | null {
  const native = NativeModules.YunoSdk;
  if (!native) {
    logger.error('events: YunoSdk native module not available');
    return null;
  }
  return new NativeEventEmitter(native);
}

interface YunoEventsCallbacks {
  onPaymentStatus?: (state: YunoPaymentState) => void;
  onEnrollmentStatus?: (state: YunoEnrollmentState) => void;
  onOTT?: (token: string) => void;
  onOTTInfo?: (info: OneTimeTokenInfo) => void;
}

export const useYunoEvents = (callbacks: YunoEventsCallbacks) => {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const emitter = getYunoEventEmitter();
    if (!emitter) {
      return;
    }

    const subscriptions = [
      emitter.addListener('YunoPaymentStatus', (state: YunoPaymentState) => {
        logger.info('event: YunoPaymentStatus', {status: state.status});
        callbacksRef.current.onPaymentStatus?.(state);
      }),
      emitter.addListener('YunoEnrollmentStatus', (state: YunoEnrollmentState) => {
        logger.info('event: YunoEnrollmentStatus', {status: state.status});
        callbacksRef.current.onEnrollmentStatus?.(state);
      }),
      emitter.addListener('YunoOneTimeToken', (token: string) => {
        logger.info('event: YunoOneTimeToken', {token: mask(token)});
        callbacksRef.current.onOTT?.(token);
      }),
      emitter.addListener('YunoOneTimeTokenInfo', (info: OneTimeTokenInfo) => {
        logger.info('event: YunoOneTimeTokenInfo', {type: info?.type ?? null});
        callbacksRef.current.onOTTInfo?.(info);
      }),
    ];

    return () => {
      subscriptions.forEach(sub => sub.remove());
    };
  }, []);
};
