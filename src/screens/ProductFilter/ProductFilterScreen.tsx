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
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Filter</Text>
        <Pressable onPress={handleReset} hitSlop={8}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      {loadingPool ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Gender</Text>
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

          <Text style={styles.sectionLabel}>Brand (select multiple)</Text>
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

          <Text style={styles.sectionLabel}>Price Range</Text>
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
            <Text style={styles.priceDash}>—</Text>
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
        </ScrollView>
      )}

      <View style={styles.footer}>
        <AppButton label="Apply Filter" onPress={handleApply} />
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
  headerTitle: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
  },
  resetText: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.title,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  priceCurrency: {
    color: colors.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  priceDash: {
    marginHorizontal: spacing.sm,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});