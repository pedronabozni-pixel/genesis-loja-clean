"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/store";

const CART_STORAGE_KEY = "genesis_store_cart";
const MAX_CART_ITEM_QUANTITY = 99;

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  hasProduct: (productId: string) => boolean;
  getQuantity: (productId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as CartItem[];
    return parsed
      .filter((item) => item.productId && item.quantity > 0)
      .map((item) => ({
        ...item,
        quantity: Math.min(item.quantity, MAX_CART_ITEM_QUANTITY)
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    function addItem(productId: string, quantity = 1) {
      setItems((current) => {
        const existing = current.find((item) => item.productId === productId);

        if (existing) {
          return current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_CART_ITEM_QUANTITY) }
              : item
          );
        }

        return [...current, { productId, quantity: Math.min(quantity, MAX_CART_ITEM_QUANTITY) }];
      });
    }

    function removeItem(productId: string) {
      setItems((current) => current.filter((item) => item.productId !== productId));
    }

    function setQuantity(productId: string, quantity: number) {
      setItems((current) => {
        if (quantity <= 0) {
          return current.filter((item) => item.productId !== productId);
        }

        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, MAX_CART_ITEM_QUANTITY) }
            : item
        );
      });
    }

    function clearCart() {
      setItems([]);
    }

    function hasProduct(productId: string) {
      return items.some((item) => item.productId === productId);
    }

    function getQuantity(productId: string) {
      return items.find((item) => item.productId === productId)?.quantity ?? 0;
    }

    return {
      items,
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      hasProduct,
      getQuantity
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }

  return context;
}

export function mapCartItems(products: Product[], items: CartItem[]) {
  return items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        return null;
      }

      return { product, quantity: item.quantity };
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number }>;
}
