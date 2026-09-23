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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Product } from '../../types/product';
import { useFilter } from '../../context/FilterContext';
import { HomeStackParamList } from '../../navigation/HomeStack';

// Replace with the logged-in user's name/avatar once wired to auth state
const MOCK_USER = {
  name: 'Kashfe Ahmed',
  avatar: require('../../../assets/avatar-placeholder.png'),
};

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { filterResult, clearFilter } = useFilter();
  const filterAppliedRef = useRef(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilterLabel, setAppliedFilterLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    try {
      const [productList, categoryList] = await Promise.all([
        getAllProducts(20),
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

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Receive filtered results coming back from ProductFilterScreen (via context)
  useEffect(() => {
    if (filterResult) {
      filterAppliedRef.current = true;
      setProducts(filterResult.products);
      setAppliedFilterLabel(filterResult.label);
      setSearchQuery('');
      setActiveCategory('All');
    }
  }, [filterResult]);

  // Debounced live search — takes priority over category selection while typing
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
      const list =
        category === 'All' ? await getAllProducts(20) : await getProductsByCategory(category);
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
    loadInitial();
  };

  const listTitle = appliedFilterLabel
    ? appliedFilterLabel
    : searchQuery.trim()
    ? `Results for "${searchQuery.trim()}"`
    : activeCategory === 'All'
    ? 'Recommended'
    : activeCategory;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Image source={MOCK_USER.avatar} style={styles.avatar} />
                <View>
                  <Text style={styles.greetingLabel}>Welcome back,</Text>
                  <Text style={styles.greetingName}>{MOCK_USER.name}</Text>
                </View>
              </View>
              <Ionicons name="cart-outline" size={24} color={colors.textPrimary} />
            </View>

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
                <Ionicons name="options-outline" size={16} color={colors.white} />
                <Text style={styles.filterButtonText}>Filter</Text>
              </Pressable>
            </View>

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

            <Text style={styles.sectionTitle}>{listTitle}</Text>

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
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
                  ? "No products match this filter. Try adjusting it."
                  : searchQuery.trim()
                  ? `No results found for "${searchQuery.trim()}"`
                  : 'No products found.'}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: spacing.sm,
  },
  greetingLabel: {
    ...typography.subtitle,
    fontSize: 12,
    color: colors.textSecondary,
  },
  greetingName: {
    ...typography.title,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    padding: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 4,
  },
  filterButtonText: {
    ...typography.button,
    fontSize: 13,
    color: colors.white,
    marginLeft: 4,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
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
});