import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard';
import { colors, spacing, typography } from '../../theme/colors';
import { getAllProducts } from '../../api/products.api';
import { Product } from '../../types/product';
import { AppTabParamList } from '../../navigation/AppStack';

type NavProp = BottomTabNavigationProp<AppTabParamList, 'Products'>;
type SortOption = 'default' | 'price_asc' | 'price_desc' | 'title_asc';

// 0 = all products in DummyJSON. If your getAllProducts doesn't accept 0, use 200.
const ALL_LIMIT = 0;

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'title_asc', label: 'Name: A to Z' },
];

const SORT_SHORT_LABEL: Record<SortOption, string> = {
  default: 'Sort',
  price_asc: 'Price ↑',
  price_desc: 'Price ↓',
  title_asc: 'A-Z',
};

const sortParams = (o: SortOption): { sortBy?: string; order?: 'asc' | 'desc' } => {
  switch (o) {
    case 'price_asc': return { sortBy: 'price', order: 'asc' };
    case 'price_desc': return { sortBy: 'price', order: 'desc' };
    case 'title_asc': return { sortBy: 'title', order: 'asc' };
    default: return {};
  }
};

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const [products, setProducts] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [sortVisible, setSortVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async (option: SortOption) => {
    try {
      const { sortBy, order } = sortParams(option);
      const list = await getAllProducts(ALL_LIMIT, sortBy, order);
      setProducts(list);
      setErrorMsg(null);
    } catch {
      setErrorMsg('Could not load products. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load('default');
  }, [load]);

  const handleSort = (option: SortOption) => {
    setSortOption(option);
    setSortVisible(false);
    setLoading(true);
    load(option);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    load(sortOption);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={insets.top}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
              <View style={[styles.heroCircle, styles.heroCircleA]} />
              <View style={[styles.heroCircle, styles.heroCircleB]} />
              <Text style={styles.heroTitle}>All Products</Text>
              <Text style={styles.heroSubtitle}>Browse everything we have for you</Text>
            </View>

            <View style={styles.titleRow}>
              <Text style={[styles.sectionTitle, styles.titleLabel]} numberOfLines={1}>
                Explore Products
              </Text>
              <View style={styles.actions}>
                {!loading && (
                  <View style={styles.countPill}>
                    <Text style={styles.countText}>{products.length} items</Text>
                  </View>
                )}
                <Pressable style={styles.sortButton} onPress={() => setSortVisible(true)} hitSlop={6}>
                  <Ionicons name="swap-vertical-outline" size={14} color={colors.primary} />
                  <Text style={styles.sortButtonText}>{SORT_SHORT_LABEL[sortOption]}</Text>
                </Pressable>
              </View>
            </View>

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.navigate('Home', {
                screen: 'ProductDetails',
                params: { productId: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="sad-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          )
        }
      />

      <Modal transparent visible={sortVisible} animationType="fade">
        <Pressable style={styles.sheetOverlay} onPress={() => setSortVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => {
              const active = sortOption === opt.key;
              return (
                <Pressable key={opt.key} style={styles.sheetRow} onPress={() => handleSort(opt.key)}>
                  <Text style={[styles.sheetLabel, active && styles.sheetLabelActive]}>
                    {opt.label}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xl },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: spacing.lg },

  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  heroCircle: { position: 'absolute', backgroundColor: colors.white, opacity: 0.1, borderRadius: 999 },
  heroCircleA: { width: 200, height: 200, top: -70, right: -50 },
  heroCircleB: { width: 140, height: 140, bottom: -60, left: -40 },
  heroTitle: { ...typography.title, fontSize: 26, color: colors.white, marginTop: spacing.sm },
  heroSubtitle: { ...typography.subtitle, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  sectionTitle: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  titleLabel: { flex: 1, marginRight: spacing.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  countPill: {
    backgroundColor: colors.primary + '1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  sortButtonText: { fontSize: 11, fontWeight: '600', color: colors.primary },

  errorText: {
    color: '#C62828',
    fontSize: 13,
    backgroundColor: '#FDECEA',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { ...typography.subtitle, fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: { ...typography.title, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.sm },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetLabel: { ...typography.subtitle, fontSize: 14, color: colors.textPrimary },
  sheetLabelActive: { color: colors.primary, fontWeight: '700' },
});