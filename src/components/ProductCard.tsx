import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';
import { Product } from '../types/product';

type Props = {
  product: Product;
  onPress: () => void;
};

export default function ProductCard({ product, onPress }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />

        <Pressable
          style={styles.favoriteBtn}
          hitSlop={8}
          onPress={handleFavoritePress}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={16}
            color={isFavorite ? colors.primary : colors.textPrimary}
          />
        </Pressable>
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {product.title}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.price}>${product.price}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },

  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  price: {
    ...typography.button,
    fontSize: 14,
    color: colors.textPrimary,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  rating: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
});
