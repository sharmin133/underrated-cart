import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { addToCartRequest } from '../api/cart.api';
import { useAuth } from './AuthContext';

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { userId } = useAuth();

  const addToCart = (product: Product, quantity = 1, size?: string) => {
    // Local state is the source of truth since DummyJSON's cart writes
    // don't actually persist — update UI instantly, then fire the API
    // call in the background purely for realism/demo purposes.
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity, size }];
    });

    if (userId) {
      addToCartRequest(userId, product.id, quantity).catch(() => {
        // Silently ignore — mock server, local state already updated.
      });
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}