import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';
import { getProductById } from '../../api/products.api';
import { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { HomeStackParamList } from '../../navigation/HomeStack';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'ProductDetails'>;
type RouteProps = RouteProp<HomeStackParamList, 'ProductDetails'>;

// DummyJSON has no size data — shown as a static option set to match the design
const MOCK_SIZES = ['S', 'M', 'L', 'XL'];

export default function ProductDetailsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(MOCK_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductById(route.params.productId);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize);
    Alert.alert('Added to cart', `${product.title} (x${quantity}) added to your cart.`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />

          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            style={styles.favoriteButton}
            onPress={() => setIsFavorite((prev) => !prev)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewText}>· {product.brand ?? product.category}</Text>
          </View>

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionLabel}>Size</Text>
          <View style={styles.sizeRow}>
            {MOCK_SIZES.map((size) => (
              <Pressable
                key={size}
                style={[styles.sizeChip, selectedSize === size && styles.sizeChipActive]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size && styles.sizeTextActive,
                  ]}
                >
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.quantityRow}>
            <Pressable
              style={styles.quantityButton}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable
              style={styles.quantityButton}
              onPress={() => setQuantity((q) => q + 1)}
            >
              <Ionicons name="add" size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton label="Add to Cart" onPress={handleAddToCart} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  price: {
    ...typography.title,
    fontSize: 18,
    color: colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ratingText: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  reviewText: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  sectionLabel: {
    ...typography.title,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  description: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sizeChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeText: {
    ...typography.button,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sizeTextActive: {
    color: colors.white,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    ...typography.button,
    fontSize: 15,
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});