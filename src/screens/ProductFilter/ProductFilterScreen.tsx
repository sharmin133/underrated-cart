import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';
import { getAllProducts } from '../../api/products.api';
import { Product } from '../../types/product';
import { useFilter } from '../../context/FilterContext';
import { HomeStackParamList } from '../../navigation/HomeStack';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'ProductFilter'>;

type Gender = 'All' | 'Men' | 'Women';

// Red accent palette — tweak these if you want a different tone of red
const ACCENT = '#D32F2F';
const ACCENT_SOFT = '#FDECEA';
const ACCENT_BORDER = '#F4B7B2';

export default function ProductFilterScreen() {
  const navigation = useNavigation<NavProp>();
  const { applyFilter } = useFilter();

  const [pool, setPool] = useState<Product[]>([]);
  const [loadingPool, setLoadingPool] = useState(true);

  const [gender, setGender] = useState<Gender>('All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const products = await getAllProducts(100);
        setPool(products);
      } finally {
        setLoadingPool(false);
      }
    })();
  }, []);

  const brands = Array.from(
    new Set(pool.map((p) => p.brand).filter((b): b is string => !!b))
  ).slice(0, 12);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const activeFilterCount =
    (gender !== 'All' ? 1 : 0) +
    selectedBrands.length +
    (minPrice !== '' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0);

  const handleApply = () => {
    let result = pool;

    if (gender === 'Men') {
      result = result.filter((p) => p.category.startsWith('mens-'));
    } else if (gender === 'Women') {
      result = result.filter((p) => p.category.startsWith('womens-'));
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter((p) => p.price >= min);
    if (!isNaN(max)) result = result.filter((p) => p.price <= max);

    const labelParts = [
      gender !== 'All' ? gender : null,
      selectedBrands.length > 0 ? selectedBrands.join(', ') : null,
      !isNaN(min) || !isNaN(max) ? 'Price range' : null,
    ].filter(Boolean);

    applyFilter(result, labelParts.length ? labelParts.join(' · ') : 'Filtered');
    navigation.goBack();
  };

  const handleReset = () => {
    setGender('All');
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.headerIconButton}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Filter</Text>
          {activeFilterCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>
        <Pressable onPress={handleReset} hitSlop={8}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      {loadingPool ? (
        <ActivityIndicator color={ACCENT} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBadge}>
                <Ionicons name="male-female-outline" size={14} color={ACCENT} />
              </View>
              <Text style={styles.sectionLabel}>Gender</Text>
            </View>
            <View style={styles.chipRow}>
              {(['All', 'Men', 'Women'] as Gender[]).map((g) => (
                <Pressable
                  key={g}
                  style={[styles.chip, gender === g && styles.chipActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBadge}>
                <Ionicons name="pricetags-outline" size={14} color={ACCENT} />
              </View>
              <Text style={styles.sectionLabel}>Brand</Text>
              <Text style={styles.sectionHint}>select multiple</Text>
            </View>
            <View style={styles.chipRow}>
              {brands.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <Pressable
                    key={brand}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleBrand(brand)}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={colors.white}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {brand}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBadge}>
                <Ionicons name="cash-outline" size={14} color={ACCENT} />
              </View>
              <Text style={styles.sectionLabel}>Price Range</Text>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceCurrency}>$</Text>
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="Min"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>
              <View style={styles.priceDashWrapper}>
                <View style={styles.priceDashLine} />
              </View>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceCurrency}>$</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="Max"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <AppButton
          label={activeFilterCount > 0 ? `Apply Filter (${activeFilterCount})` : 'Apply Filter'}
          onPress={handleApply}
          style={styles.applyButton}
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
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
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
  resetText: {
    ...typography.subtitle,
    fontSize: 13,
    color: ACCENT,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  sectionHint: {
    ...typography.subtitle,
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  chipText: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  priceCurrency: {
    color: ACCENT,
    fontWeight: '700',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  priceDashWrapper: {
    width: spacing.lg,
    alignItems: 'center',
  },
  priceDashLine: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  applyButton: {
    backgroundColor: ACCENT,
  },
});