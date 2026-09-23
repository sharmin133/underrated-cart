import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';


type Props = {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
};

export default function AppButton({ label, onPress, variant = 'filled', style }: Props) {
  const isFilled = variant === 'filled';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isFilled ? styles.filled : styles.outline,
        pressed && { opacity: 0.85 },
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