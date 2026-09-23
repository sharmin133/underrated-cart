import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
};

export default function AppButton({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  style,
}: Props) {
  const isFilled = variant === 'filled';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isFilled ? styles.filled : styles.outline,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      <Text style={[styles.label, isFilled ? styles.labelFilled : styles.labelOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  label: {
    ...typography.button,
  },
  labelFilled: {
    color: colors.white,
  },
  labelOutline: {
    color: colors.primary,
  },
});