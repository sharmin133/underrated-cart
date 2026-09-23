import { apiClient } from './client';

export async function addToCartRequest(userId: number, productId: number, quantity: number) {
  const { data } = await apiClient.post('/carts/add', {
    userId,
    products: [{ id: productId, quantity }],
  });
  return data;
}

export async function getUserCartRequest(userId: number) {
  const { data } = await apiClient.get(`/carts/user/${userId}`);
  return data;
}

export async function updateCartRequest(cartId: number, products: { id: number; quantity: number }[]) {
  const { data } = await apiClient.put(`/carts/${cartId}`, { merge: true, products });
  return data;
}

export async function deleteCartRequest(cartId: number) {
  const { data } = await apiClient.delete(`/carts/${cartId}`);
  return data;
}