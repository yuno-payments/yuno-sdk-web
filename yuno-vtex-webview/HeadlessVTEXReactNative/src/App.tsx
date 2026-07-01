/**
 * VTEX headless + Yuno RN SDK — Google Pay / Apple Pay preflight demo.
 *
 * Boots straight into the checkout screen. The SDK is initialized in JS once
 * the preflight call returns the public API key (see useVtexWalletCheckout).
 */

import React from 'react';
import {Platform, StatusBar, StyleSheet, SafeAreaView as RNSafeAreaView} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView as SACSafeAreaView,
} from 'react-native-safe-area-context';
import {CheckoutScreen} from './screens';
import {useTheme} from './hooks';

// iOS: built-in SafeAreaView (avoids a Fabric event-emitter crash);
// Android: the safe-area-context one (built-in is a no-op on Android).
const SafeAreaView = Platform.OS === 'ios' ? RNSafeAreaView : SACSafeAreaView;

function App(): React.JSX.Element {
  const {colors, isDark} = useTheme();

  const content = (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />
      <CheckoutScreen />
    </SafeAreaView>
  );

  if (Platform.OS === 'android') {
    return <SafeAreaProvider>{content}</SafeAreaProvider>;
  }
  return content;
}

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default App;
