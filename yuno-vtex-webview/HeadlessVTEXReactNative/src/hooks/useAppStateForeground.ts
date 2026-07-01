/**
 * Hook to detect when the app returns to foreground
 */

import {useEffect, useRef} from 'react';
import {AppState, type AppStateStatus} from 'react-native';

interface AppStateForegroundCallbacks {
  onForeground?: () => void;
  onBackground?: () => void;
}

export const useAppStateForeground = (
  callbacks: AppStateForegroundCallbacks,
) => {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        console.log(
          '📱 AppState changed from:',
          appState.current,
          'to:',
          nextAppState,
        );

        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log('✅ App has come to the foreground!');
          callbacksRef.current.onForeground?.();
        } else if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          console.log('⚠️ App has gone to the background');
          callbacksRef.current.onBackground?.();
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
};

