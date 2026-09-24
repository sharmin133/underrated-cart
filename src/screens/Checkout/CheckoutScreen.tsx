import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { HomeStackParamList } from '../../navigation/HomeStack';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Checkout'>;

const DELIVERY_CHARGE = 10;

// Same red accent used across the app — tweak here to re-theme everywhere
const ACCENT = '#D32F2F';
const ACCENT_SOFT = '#FDECEA';

// Mock payment methods — no real payment gateway wired up for this assessment
const PAYMENT_METHODS = [
  { id: 'wallet', label: 'My Pocket Wallet', icon: 'wallet-outline' as const },
  { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' as const },
];

export default function CheckoutScreen() {
  const navigation = useNavigation<NavProp>();
  const { items, totalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);

  const subtotal = totalPrice;
  const total = subtotal + DELIVERY_CHARGE;

  const handleOrderNow = () => {
    clearCart();
    navigation.navigate('Success');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerIconButton}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Check Out</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconBadge}>
            <Ionicons name="location-outline" size={14} color={ACCENT} />
          </View>
          <Text style={styles.sectionLabel}>Delivery Address</Text>
        </View>
        <View style={styles.sectionCard}>
          <View style={styles.addressRow}>
            <View style={styles.addressIconCircle}>
              <Ionicons name="home-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.addressText}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressSubtitle}>
                221B Baker Street, Dhaka 1207, Bangladesh
              </Text>
            </View>
            <Pressable hitSlop={8}>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconBadge}>
            <Ionicons name="card-outline" size={14} color={ACCENT} />
          </View>
          <Text style={styles.sectionLabel}>Payment Method</Text>
        </View>
        <View style={styles.sectionCard}>
          {PAYMENT_METHODS.map((method, index) => {
            const isSelected = selectedPayment === method.id;
            return (
              <Pressable
                key={method.id}
                style={[
                  styles.paymentRow,
                  index !== PAYMENT_METHODS.length - 1 && styles.paymentRowDivider,
                  isSelected && styles.paymentRowActive,
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View
                  style={[
                    styles.paymentIconCircle,
                    isSelected && styles.paymentIconCircleActive,
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={17}
                    color={isSelected ? colors.white : colors.textSecondary}
                  />
                </View>
                <Text style={styles.paymentLabel}>{method.label}</Text>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? ACCENT : colors.textSecondary}
                />
              </Pressable>
            );
          })}
          <Pressable style={styles.addPaymentRow}>
            <Ionicons name="add-circle-outline" size={16} color={ACCENT} />
            <Text style={styles.addPaymentText}>Add new payment method</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconBadge}>
            <Ionicons name="receipt-outline" size={14} color={ACCENT} />
          </View>
          <Text style={styles.sectionLabel}>Order Summary</Text>
        </View>
        <View style={styles.sectionCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({items.length})</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
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
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={`Order Now · $${total.toFixed(2)}`}
          onPress={handleOrderNow}
          disabled={items.length === 0}
          style={styles.orderButton}
        />
      </View>
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
  headerTitle: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    ...typography.title,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  addressTitle: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addressSubtitle: {
    ...typography.subtitle,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeText: {
    ...typography.subtitle,
    fontSize: 12,
    color: ACCENT,
    fontWeight: '700',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  paymentRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  paymentRowActive: {
    backgroundColor: ACCENT_SOFT,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 0,
  },
  paymentIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconCircleActive: {
    backgroundColor: ACCENT,
  },
  paymentLabel: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  addPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addPaymentText: {
    ...typography.subtitle,
    fontSize: 13,
    color: ACCENT,
    fontWeight: '600',
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  orderButton: {
    backgroundColor: ACCENT,
  },
});