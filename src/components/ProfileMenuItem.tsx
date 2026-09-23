import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

export default function ProfileMenuItem({ icon, label, onPress, danger = false }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.primary : colors.textPrimary}
        />
        <Text style={[styles.label, danger && styles.dangerLabel]}>{label}</Text>
      </View>
      {!danger && (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.subtitle,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  dangerLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});