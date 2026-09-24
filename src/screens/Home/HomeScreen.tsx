import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard';
import CategoryGrid from '../../components/CategoryGrid';
import { colors, spacing, typography } from '../../theme/colors';
import {
  getAllProducts,
  getCategories,
  getProductsByCategory,
  searchProducts,
} from '../../api/products.api';
import { getCurrentUser } from '../../api/auth.api';
import { getToken } from '../../utils/storage';
import { Product } from '../../types/product';
import { useFilter } from '../../context/FilterContext';
import { useCart } from '../../context/CartContext';
import { HomeStackParamList } from '../../navigation/HomeStack';

const AVATAR = require('../../../assets/avatar-placeholder.png');

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'title_asc';

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

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { filterResult, clearFilter } = useFilter();
  const { totalItems } = useCart();
  const filterAppliedRef = useRef(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilterLabel, setAppliedFilterLabel] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  // Load logged-in user's name
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await getCurrentUser(token);
          setUserName(`${data.firstName} ${data.lastName}`);
        }
      } catch (err) {
        // fallback name will be shown
      }
    })();
  }, []);

  const sortParams = (option: SortOption): { sortBy?: string; order?: 'asc' | 'desc' } => {
    switch (option) {
      case 'price_asc':
        return { sortBy: 'price', order: 'asc' };
      case 'price_desc':
        return { sortBy: 'price', order: 'desc' };
      case 'title_asc':
        return { sortBy: 'title', order: 'asc' };
      default:
        return {};
    }
  };

  const loadInitial = useCallback(async (sortBy?: string, order?: 'asc' | 'desc') => {
    try {
      const [productList, categoryList] = await Promise.all([
        getAllProducts(20, sortBy, order),
        getCategories(),
      ]);
      // Skip applying this result if a filter was applied while this
      // request was still in flight — prevents it from overwriting
      // the filtered list the user just asked for.
      if (!filterAppliedRef.current) {
        setProducts(productList);
      }
      setCategories(categoryList);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg('Could not load products. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Run once on mount only — sort/category/search changes are handled by
  // their own dedicated handlers below.
  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterResult) {
      filterAppliedRef.current = true;
      setProducts(filterResult.products);
      setAppliedFilterLabel(filterResult.label);
      setSearchQuery('');
      setActiveCategory('All');
    }
  }, [filterResult]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) return;

    const timeout = setTimeout(async () => {
      filterAppliedRef.current = false;
      clearFilter();
      setLoading(true);
      try {
        const results = await searchProducts(searchQuery.trim());
        setProducts(results);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg('Search failed. Try again.');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelectCategory = async (category: string) => {
    filterAppliedRef.current = false;
    clearFilter();
    setSearchQuery('');
    setAppliedFilterLabel(null);
    setActiveCategory(category);
    setLoading(true);
    try {
      const { sortBy, order } = sortParams(sortOption);
      const list =
        category === 'All'
          ? await getAllProducts(20, sortBy, order)
          : await getProductsByCategory(category, sortBy, order);
      setProducts(list);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg('Could not load this category.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    filterAppliedRef.current = false;
    clearFilter();
    setRefreshing(true);
    setSearchQuery('');
    setAppliedFilterLabel(null);
    setActiveCategory('All');
    const { sortBy, order } = sortParams(sortOption);
    loadInitial(sortBy, order);
  };

  const handleSortSelect = async (option: SortOption) => {
    setSortOption(option);
    setSortMenuVisible(false);

    // Search results and applied-filter results are re-sorted client-side
    // (see sortedProducts below) since they don't come from a plain
    // category/list endpoint call. Category/All browsing re-fetches with
    // the documented sortBy/order query params.
    if (searchQuery.trim() || appliedFilterLabel) return;

    setLoading(true);
    try {
      const { sortBy, order } = sortParams(option);
      const list =
        activeCategory === 'All'
          ? await getAllProducts(20, sortBy, order)
          : await getProductsByCategory(activeCategory, sortBy, order);
      setProducts(list);
    } catch (err) {
      setErrorMsg('Could not apply sorting.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side fallback so sorting also visibly applies to search results
  // and applied-filter results.
  const sortedProducts = React.useMemo(() => {
    if (!searchQuery.trim() && !appliedFilterLabel) return products;
    const list = [...products];
    if (sortOption === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sortOption === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (sortOption === 'title_asc') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, sortOption, searchQuery, appliedFilterLabel]);

  const listTitle = appliedFilterLabel
    ? appliedFilterLabel
    : searchQuery.trim()
    ? `Results for "${searchQuery.trim()}"`
    : activeCategory === 'All'
    ? 'Recommended'
    : activeCategory;

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedProducts}
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
            {/* Hero */}
            <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
              <View style={[styles.heroCircle, styles.heroCircleA]} />
              <View style={[styles.heroCircle, styles.heroCircleB]} />

              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Image source={AVATAR} style={styles.avatar} />
                  <View>
                    <Text style={styles.greetingLabel}>Welcome back 👋</Text>
                    <Text style={styles.greetingName}>{userName || 'Guest'}</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => navigation.navigate('Cart')}
                  style={styles.cartIconWrapper}
                >
                  <Ionicons name="cart-outline" size={24} color={colors.white} />
                  {totalItems > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{totalItems}</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <Text style={styles.heroTagline}>Find fresh & healthy{'\n'}products for you</Text>
            </View>

            {/* Floating search */}
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search for products..."
                  placeholderTextColor={colors.textSecondary}
                  style={styles.searchInput}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>

              <Pressable
                style={styles.filterButton}
                onPress={() => navigation.navigate('ProductFilter')}
              >
                <Ionicons name="options-outline" size={19} color={colors.white} />
                <Text style={styles.filterText}>Filter</Text>
              </Pressable>
            </View>

            <View style={styles.body}>
              {!searchQuery.trim() && (
                <>
                  <Text style={styles.sectionTitle}>Categories</Text>
                  <CategoryGrid
                    categories={categories}
                    activeCategory={activeCategory === 'All' ? '' : activeCategory}
                    onSelect={handleSelectCategory}
                  />
                </>
              )}

              {/* Title row — sectionTitle can shrink/ellipsize so long
                  filter labels never push the count pill or sort button
                  off-screen. */}
              <View style={styles.titleRow}>
                <Text
                  style={[styles.sectionTitle, styles.titleRowLabel]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {listTitle}
                </Text>

                <View style={styles.titleRowActions}>
                  {!loading && (
                    <View style={styles.countPill}>
                      <Text style={styles.countText} numberOfLines={1}>
                        {products.length} items
                      </Text>
                    </View>
                  )}

                  <Pressable
                    style={styles.sortButton}
                    onPress={() => setSortMenuVisible(true)}
                    hitSlop={6}
                  >
                    <Ionicons name="swap-vertical-outline" size={14} color={colors.primary} />
                    <Text style={styles.sortButtonText} numberOfLines={1}>
                      {SORT_SHORT_LABEL[sortOption]}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="sad-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {appliedFilterLabel
                  ? 'No products match this filter. Try adjusting it.'
                  : searchQuery.trim()
                  ? `No results found for "${searchQuery.trim()}"`
                  : 'No products found.'}
              </Text>
            </View>
          )
        }
      />

      {/* Sort bottom sheet */}
      <Modal transparent visible={sortMenuVisible} animationType="fade">
        <Pressable style={styles.sortOverlay} onPress={() => setSortMenuVisible(false)}>
          <Pressable style={styles.sortSheet} onPress={() => {}}>
            <View style={styles.sortSheetHandle} />
            <Text style={styles.sortSheetTitle}>Sort By</Text>

            {SORT_OPTIONS.map((opt) => {
              const isActive = sortOption === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={styles.sortRow}
                  onPress={() => handleSortSelect(opt.key)}
                >
                  <Text style={[styles.sortRowLabel, isActive && styles.sortRowLabelActive]}>
                    {opt.label}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
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
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  body: { paddingHorizontal: spacing.lg },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: 56,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    backgroundColor: colors.white,
    opacity: 0.1,
    borderRadius: 999,
  },
  heroCircleA: { width: 220, height: 220, top: -80, right: -60 },
  heroCircleB: { width: 160, height: 160, bottom: -70, left: -50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.white,
  },
  greetingLabel: {
    ...typography.subtitle,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  greetingName: {
    ...typography.title,
    fontSize: 17,
    color: colors.white,
  },
  heroTagline: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 30,
    color: colors.white,
    marginTop: spacing.lg,
  },
  cartIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  filterButton: {
    width: 78,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#df343f',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#e7dede',
  },
  filterText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Search (overlaps hero)
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -28,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    padding: 0,
  },

  // Sections
  sectionTitle: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
  },
  // Title row — flex layout that keeps the right-side controls
  // (count pill + sort button) always visible on-screen. The label
  // shrinks and ellipsizes instead of pushing them out.
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  titleRowLabel: {
    flex: 1,
    flexShrink: 1,
    marginBottom: 0,
    marginRight: spacing.sm,
  },
  titleRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: spacing.xs,
  },
  countPill: {
    backgroundColor: colors.primary + '1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
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
  sortButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    backgroundColor: '#FDECEA',
    padding: 10,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },

  // Sort bottom sheet
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sortSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sortSheetTitle: {
    ...typography.title,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sortRowLabel: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sortRowLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});