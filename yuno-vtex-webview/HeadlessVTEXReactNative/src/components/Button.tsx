/**
 * Reusable button component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {spacing, typography} from '../theme';
import {useTheme} from '../hooks';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    styles[variant],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyleFinal = [
    styles.text,
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      testID={testID}
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.text : colors.textInverse}
        />
      ) : (
        <Text style={textStyleFinal}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    ...typography.button,
  },
  // Variants
  primary: {
    backgroundColor: colors.text,      // neutralB (black in light, white in dark)
  },
  primaryText: {
    color: colors.textInverse,         // neutralW (white in light, black in dark)
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.text,          // neutralB (black in light, white in dark)
  },
  secondaryText: {
    color: colors.text,                // neutralB (black in light, white in dark)
  },
  success: {
    backgroundColor: colors.success,
  },
  successText: {
    color: colors.textInverse,
  },
  error: {
    backgroundColor: colors.error,
  },
  errorText: {
    color: colors.textInverse,
  },
  // States
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  disabledText: {
    color: colors.disabledText,
  },
});

