import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function CategoryChip({ label, active, onPress }: Props) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  labelActive: {
    color: colors.white,
    fontWeight: '600',
  },
});