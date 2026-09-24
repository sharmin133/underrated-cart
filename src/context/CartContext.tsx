import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import {
  addToCartRequest,
  getUserCartRequest,
  updateCartRequest,
  deleteCartRequest,
} from '../api/cart.api';
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
  const remoteCartId = useRef<number | null>(null);

  
  useEffect(() => {
    if (!userId) return;
    getUserCartRequest(userId).catch(() => {
      // Mock server — safe to ignore if this user has no seeded cart.
    });
  }, [userId]);

  const syncRemoteCart = (nextItems: CartItem[]) => {
    if (!userId) return;
    const products = nextItems.map((i) => ({ id: i.product.id, quantity: i.quantity }));

    if (!remoteCartId.current) {
      // First write for this session — creates the cart and remembers its id.
      addToCartRequest(userId, products[0]?.id, products[0]?.quantity ?? 1)
        .then((cart: any) => {
          remoteCartId.current = cart?.id ?? null;
        })
        .catch(() => {});
    } else {
      // Subsequent writes — update the existing mock cart.
      updateCartRequest(remoteCartId.current, products).catch(() => {});
    }
  };

  const addToCart = (product: Product, quantity = 1, size?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const next = existing
        ? prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...prev, { product, quantity, size }];
      syncRemoteCart(next);
      return next;
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) => {
      const next = prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
      if (remoteCartId.current) {
        updateCartRequest(
          remoteCartId.current,
          next.map((i) => ({ id: i.product.id, quantity: i.quantity }))
        ).catch(() => {});
      }
      return next;
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId);
      if (remoteCartId.current) {
        updateCartRequest(
          remoteCartId.current,
          next.map((i) => ({ id: i.product.id, quantity: i.quantity }))
        ).catch(() => {});
      }
      return next;
    });
  };

  const clearCart = () => {
    if (remoteCartId.current) {
      deleteCartRequest(remoteCartId.current).catch(() => {});
      remoteCartId.current = null;
    }
    setItems([]);
  };

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