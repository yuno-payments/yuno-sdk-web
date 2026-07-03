/**
 * Single-screen demo of the VTEX-preflight + Yuno wallet flow.
 * Presentation only — all flow logic lives in useVtexWalletCheckout.
 */

import React, {useCallback, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {YunoPaymentMethods} from '@yuno-payments/yuno-sdk-react-native';
import {Button, Card} from '../components';
import {useTheme} from '../hooks';
import {spacing, typography} from '../theme';
import {CHECKOUT, YUNO} from '../config';
import {useVtexWalletCheckout} from '../hooks/useVtexWalletCheckout';
import {generateOrderFormId} from '../utils/orderId';

const formatAmount = (value: number, currency: string): string =>
  `${currency} ${value.toFixed(2)}`;

/** Parse a user-typed amount, tolerating pt-BR comma decimals ("100,50"). */
const parseAmount = (text: string): number => Number(text.trim().replace(',', '.'));

export function CheckoutScreen(): React.JSX.Element {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {state, startSession, presentWalletLite, reset} = useVtexWalletCheckout();
  const [amountText, setAmountText] = useState(CHECKOUT.defaultAmount.toFixed(2));
  const [orderFormId, setOrderFormId] = useState(() => generateOrderFormId());

  const isIdle = state.phase === 'idle';

  const handleStart = useCallback(() => {
    const amount = parseAmount(amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter an order value greater than 0.');
      return;
    }
    const id = orderFormId.trim();
    if (!id) {
      Alert.alert('orderFormId required', 'Enter or generate an orderFormId.');
      return;
    }
    void startSession({amount, orderFormId: id});
  }, [amountText, orderFormId, startSession]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const isBusy =
    state.phase === 'creatingSession' || state.phase === 'processingPayment';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Card title="🛒 Cart">
        {isIdle ? (
          <>
            <View style={styles.fieldRow}>
              <Text style={styles.rowLabel}>Order</Text>
              <View style={styles.orderIdWrap}>
                <TextInput
                  testID="orderform-input"
                  style={styles.orderIdInput}
                  value={orderFormId}
                  onChangeText={setOrderFormId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  testID="generate-orderform"
                  onPress={() => setOrderFormId(generateOrderFormId())}
                  style={styles.generateBtn}>
                  <Text style={styles.generateBtnText}>Generate</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Row label="Country" value={CHECKOUT.country} />
            <View style={styles.fieldRow}>
              <Text style={styles.rowLabel}>Order value</Text>
              <View style={styles.amountInputWrap}>
                <Text style={styles.currency}>{CHECKOUT.currency}</Text>
                <TextInput
                  testID="amount-input"
                  style={styles.amountInput}
                  value={amountText}
                  onChangeText={setAmountText}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <Row label="Order" value={state.orderFormId ?? orderFormId} />
            <Row label="Country" value={CHECKOUT.country} />
            <Row
              label="Total"
              value={formatAmount(state.amount ?? parseAmount(amountText), CHECKOUT.currency)}
              emphasize
            />
          </>
        )}
      </Card>

      {isIdle && (
        <Button title="Start payment" onPress={handleStart} testID="start-checkout" />
      )}

      {state.phase === 'creatingSession' && (
        <Button title="Creating session…" onPress={() => {}} loading disabled />
      )}

      {state.phase === 'ready' && (
        <Card title="Payment method">
          <Text style={styles.hint}>
            Tap Pay to open the wallet (Google Pay / Apple Pay).
          </Text>
          <YunoPaymentMethods
            testID="yuno-payment-methods"
            checkoutSession={state.checkoutSession ?? ''}
            countryCode={YUNO.countryCode}
            style={styles.paymentMethods}
          />
          <Button
            title="Pay"
            variant="success"
            onPress={() => void presentWalletLite()}
            testID="pay-button"
          />
        </Card>
      )}

      {state.phase === 'processingPayment' && (
        <Button title="Processing payment…" onPress={() => {}} loading disabled />
      )}

      {state.phase === 'deferred' && (
        <Card title="Deferred payment">
          <Text style={styles.hint}>
            OTT captured. The payment will be created during VTEX authorization.
            Place the order in VTEX using this orderFormId:
          </Text>
          <Row label="orderFormId" value={state.orderFormId ?? orderFormId} />
        </Card>
      )}

      {state.paymentStatus && (
        <Card title="SDK result">
          <Row label="Status" value={state.paymentStatus} emphasize />
        </Card>
      )}

      {state.phase === 'error' && (
        <Card title="Error">
          <Text style={styles.errorText}>{state.errorMessage}</Text>
        </Card>
      )}

      {(state.phase === 'done' || state.phase === 'deferred' || state.phase === 'error') &&
        !isBusy && (
          <Button title="Restart" variant="secondary" onPress={handleReset} testID="reset-button" />
        )}
    </ScrollView>
  );
}

interface RowProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

function Row({label, value, emphasize}: RowProps): React.JSX.Element {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, emphasize && styles.rowValueStrong]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen: {flex: 1, backgroundColor: colors.background},
    content: {padding: spacing.md},
    hint: {...typography.body, color: colors.textSecondary, marginBottom: spacing.sm},
    paymentMethods: {width: '100%', minHeight: 320, marginBottom: spacing.md},
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    rowLabel: {...typography.body, color: colors.textSecondary},
    rowValue: {...typography.body, color: colors.text, flexShrink: 1, marginLeft: spacing.md},
    rowValueStrong: {...typography.h3, color: colors.text},
    fieldRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    orderIdWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      marginLeft: spacing.md,
    },
    orderIdInput: {
      ...typography.bodySmall,
      color: colors.text,
      flexShrink: 1,
      minWidth: 120,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    generateBtn: {
      marginLeft: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
      backgroundColor: colors.borderLight,
    },
    generateBtnText: {...typography.bodySmall, color: colors.text},
    amountInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.sm,
      minWidth: 140,
    },
    currency: {...typography.body, color: colors.textSecondary, marginRight: spacing.xs},
    amountInput: {
      ...typography.h3,
      color: colors.text,
      flex: 1,
      paddingVertical: spacing.xs,
      textAlign: 'right',
    },
    errorText: {...typography.body, color: colors.error},
  });
