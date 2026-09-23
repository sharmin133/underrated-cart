import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryIconItem from './CategoryIconItem';
import { colors, spacing, typography } from '../theme/colors';
import { getCategoryIcon, formatCategoryLabel } from '../utils/category';

type Props = {
  categories: string[]; // raw slugs, "All" not included here
  activeCategory: string;
  onSelect: (category: string) => void;
};

const COLLAPSED_COUNT = 7; // + 1 "More" tile = 8 (2 rows of 4)

export default function CategoryGrid({ categories, activeCategory, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? categories : categories.slice(0, COLLAPSED_COUNT);
  const hasMore = categories.length > COLLAPSED_COUNT;

  return (
    <View>
      <View style={styles.grid}>
        {visible.map((category) => (
          <CategoryIconItem
            key={category}
            icon={getCategoryIcon(category) as any}
            label={formatCategoryLabel(category)}
            active={category === activeCategory}
            onPress={() => onSelect(category)}
          />
        ))}

        {hasMore && !expanded && (
          <Pressable style={styles.moreItem} onPress={() => setExpanded(true)}>
            <View style={styles.moreCircle}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.primary} />
            </View>
            <Text style={styles.moreLabel}>More</Text>
          </Pressable>
        )}
      </View>

      {expanded && (
        <Pressable style={styles.collapseRow} onPress={() => setExpanded(false)}>
          <Text style={styles.collapseText}>Show less</Text>
          <Ionicons name="chevron-up" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const ITEM_WIDTH = '23%';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  moreLabel: {
    ...typography.subtitle,
    fontSize: 11,
    color: colors.textPrimary,
  },
  collapseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  collapseText: {
    ...typography.subtitle,
    fontSize: 12,
    color: colors.primary,
    marginRight: 4,
  },
});