/**
 * Card component to group content
 */

import React from 'react';
import {View, Text, StyleSheet, type ViewStyle} from 'react-native';
import {spacing, typography} from '../theme';
import {useTheme} from '../hooks';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({title, children, style}) => {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.elevation,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
});

