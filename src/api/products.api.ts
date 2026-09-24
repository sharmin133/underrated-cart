import { apiClient } from './client';
import { Product } from '../types/product';

type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export async function getAllProducts(
  limit = 20,
  sortBy?: string,
  order?: 'asc' | 'desc'
): Promise<Product[]> {
  const { data } = await apiClient.get<ProductsResponse>('/products', {
    params: { limit, ...(sortBy ? { sortBy, order: order ?? 'asc' } : {}) },
  });
  return data.products;
}

export async function getCategories(): Promise<string[]> {
  const { data } = await apiClient.get('/products/categories');
  // DummyJSON returns objects like { slug, name, url } — use slug so it
  // matches both the icon map and the /products/category/{slug} endpoint
  return data.map((c: any) => (typeof c === 'string' ? c : c.slug));
}

export async function getProductsByCategory(
  category: string,
  sortBy?: string,
  order?: 'asc' | 'desc'
): Promise<Product[]> {
  const { data } = await apiClient.get<ProductsResponse>(`/products/category/${category}`, {
    params: sortBy ? { sortBy, order: order ?? 'asc' } : {},
  });
  return data.products;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data } = await apiClient.get<ProductsResponse>('/products/search', {
    params: { q: query },
  });
  return data.products;
}

export async function getProductById(id: number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}