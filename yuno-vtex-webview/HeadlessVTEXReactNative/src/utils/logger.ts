/**
 * Lightweight demo logger.
 *
 * Every line is prefixed with `[YunoVTEX]` so the full flow can be filtered from
 * the device logs while testing, e.g.:
 *
 *   npx react-native log-android | grep YunoVTEX
 *   adb logcat -s ReactNativeJS:V | grep YunoVTEX
 *
 * It is intentionally console-based (visible in Metro + logcat) and can be muted
 * with `logger.setEnabled(false)`. Tokens / API keys are masked.
 */

const TAG = '[YunoVTEX]';
let enabled = true;

function serialize(payload?: unknown): string {
  if (payload === undefined) {
    return '';
  }
  try {
    return ` ${JSON.stringify(payload)}`;
  } catch {
    return ' [unserializable payload]';
  }
}

/** Mask a secret-ish string, keeping only a short prefix for correlation. */
export function mask(value?: string | null): string {
  if (!value) {
    return String(value);
  }
  return value.length <= 8 ? '***' : `${value.slice(0, 6)}…(${value.length})`;
}

export const logger = {
  setEnabled(value: boolean): void {
    enabled = value;
  },
  info(message: string, payload?: unknown): void {
    if (enabled) {
      // eslint-disable-next-line no-console
      console.log(`${TAG} ${message}${serialize(payload)}`);
    }
  },
  error(message: string, payload?: unknown): void {
    if (enabled) {
      // console.warn avoids triggering the RN red-box overlay during a demo
      // eslint-disable-next-line no-console
      console.warn(`${TAG} ERROR ${message}${serialize(payload)}`);
    }
  },
};
