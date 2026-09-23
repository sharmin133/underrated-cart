import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function CategoryIconItem({ icon, label, active = false, onPress }: Props) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
        <Ionicons name={icon} size={20} color={active ? colors.white : colors.primary} />
      </View>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const ITEM_WIDTH = '23%';

const styles = StyleSheet.create({
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDEDEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleActive: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.subtitle,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});