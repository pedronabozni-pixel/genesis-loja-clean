"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/store";

const CART_STORAGE_KEY = "genesis_store_cart";
const MAX_CART_ITEM_QUANTITY = 99;

export type CartItem = {
  productId: string;
  quantity: number;
  selectedColor?: string;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (productId: string, quantity?: number, selectedColor?: string) => void;
  removeItem: (productId: string, selectedColor?: string) => void;
  setQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  hasProduct: (productId: string, selectedColor?: string) => boolean;
  getQuantity: (productId: string, selectedColor?: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeSelectedColor(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function getCartItemKey(productId: string, selectedColor?: string) {
  return `${productId}::${normalizeSelectedColor(selectedColor) ?? ""}`;
}

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
        selectedColor: normalizeSelectedColor(item.selectedColor),
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
    function addItem(productId: string, quantity = 1, selectedColor?: string) {
      const normalizedColor = normalizeSelectedColor(selectedColor);
      const itemKey = getCartItemKey(productId, normalizedColor);

      setItems((current) => {
        const existing = current.find((item) => getCartItemKey(item.productId, item.selectedColor) === itemKey);

        if (existing) {
          return current.map((item) =>
            getCartItemKey(item.productId, item.selectedColor) === itemKey
              ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_CART_ITEM_QUANTITY) }
              : item
          );
        }

        return [...current, { productId, quantity: Math.min(quantity, MAX_CART_ITEM_QUANTITY), selectedColor: normalizedColor }];
      });
    }

    function removeItem(productId: string, selectedColor?: string) {
      const itemKey = getCartItemKey(productId, selectedColor);
      setItems((current) => current.filter((item) => getCartItemKey(item.productId, item.selectedColor) !== itemKey));
    }

    function setQuantity(productId: string, quantity: number, selectedColor?: string) {
      const itemKey = getCartItemKey(productId, selectedColor);

      setItems((current) => {
        if (quantity <= 0) {
          return current.filter((item) => getCartItemKey(item.productId, item.selectedColor) !== itemKey);
        }

        return current.map((item) =>
          getCartItemKey(item.productId, item.selectedColor) === itemKey
            ? { ...item, quantity: Math.min(quantity, MAX_CART_ITEM_QUANTITY) }
            : item
        );
      });
    }

    function clearCart() {
      setItems([]);
    }

    function hasProduct(productId: string, selectedColor?: string) {
      const itemKey = getCartItemKey(productId, selectedColor);
      return items.some((item) => getCartItemKey(item.productId, item.selectedColor) === itemKey);
    }

    function getQuantity(productId: string, selectedColor?: string) {
      const itemKey = getCartItemKey(productId, selectedColor);
      return items.find((item) => getCartItemKey(item.productId, item.selectedColor) === itemKey)?.quantity ?? 0;
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

      return { product, quantity: item.quantity, selectedColor: normalizeSelectedColor(item.selectedColor) };
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number; selectedColor?: string }>;
}
