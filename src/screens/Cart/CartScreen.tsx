import React from 'react';
import { View, Text, Image, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../types/cart';
import { HomeStackParamList } from '../../navigation/HomeStack';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Cart'>;

const DELIVERY_CHARGE = 10;

// Same red accent used across the app — tweak here to re-theme everywhere
const ACCENT = '#D32F2F';
const ACCENT_SOFT = '#FDECEA';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { items, totalPrice, updateQuantity, removeFromCart } = useCart();

  const subtotal = totalPrice;
  const total = items.length > 0 ? subtotal + DELIVERY_CHARGE : 0;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.product.thumbnail }} style={styles.thumbnail} />

      <View style={styles.itemInfo}>
        <Text numberOfLines={1} style={styles.itemTitle}>
          {item.product.title}
        </Text>
        {item.size && (
          <View style={styles.sizePill}>
            <Text style={styles.sizePillText}>Size {item.size}</Text>
          </View>
        )}
        <Text style={styles.itemPrice}>${item.product.price}</Text>
      </View>

      <View style={styles.itemActions}>
        <Pressable
          onPress={() => removeFromCart(item.product.id)}
          hitSlop={8}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={15} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.stepper}>
          <Pressable
            style={styles.stepperButton}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={14} color={ACCENT} />
          </Pressable>
          <Text style={styles.stepperValue}>{item.quantity}</Text>
          <Pressable
            style={styles.stepperButton}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={14} color={ACCENT} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerIconButton}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {itemCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{itemCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.product.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={36} color={ACCENT} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>Items you add will show up here.</Text>
          </View>
        }
      />

      {items.length > 0 && (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={styles.summaryValue}>${DELIVERY_CHARGE.toFixed(2)}</Text>
            </View>

            <View style={styles.dashedDivider} />

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <AppButton
            label="Check Out"
            onPress={() => navigation.navigate('Checkout')}
            style={styles.checkoutButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
  },
  headerBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
    gap: spacing.sm,
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemTitle: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sizePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.background,
    marginBottom: 4,
  },
  sizePillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  itemPrice: {
    ...typography.button,
    fontSize: 14,
    color: ACCENT,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  removeButton: {
    padding: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCENT_SOFT,
    backgroundColor: ACCENT_SOFT,
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  stepperButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dashedDivider: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  totalRow: {
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  totalLabel: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.title,
    fontSize: 17,
    color: ACCENT,
  },
  checkoutButton: {
    backgroundColor: ACCENT,
  },
});