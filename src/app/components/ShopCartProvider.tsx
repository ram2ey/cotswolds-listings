"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ShopProduct } from "@/lib/shop";
import { isAvailableProduct } from "@/lib/shop";

export interface CartItem {
  cartItemId: string;
  product: ShopProduct;
  quantity: number;
  fragrance?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isReady: boolean;
  addItem: (product: ShopProduct, quantity?: number, fragrance?: string) => void;
  setQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

const STORAGE_KEY = "cotswolds-candle-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const migrated: CartItem[] = parsed.filter((item: CartItem) => item.product && isAvailableProduct(item.product)).map((item: Partial<CartItem> & { product: ShopProduct; quantity: number }) => ({
            cartItemId: item.cartItemId || (item.fragrance ? `${item.product.id}-${item.fragrance}` : item.product.id),
            product: item.product,
            quantity: item.quantity,
            fragrance: item.fragrance,
          }));
          setItems(migrated);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsReady(true);
      }
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, []);

  useEffect(() => {
    if (isReady) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const addItem = useCallback((product: ShopProduct, quantity = 1, fragrance?: string) => {
    const key = fragrance ? `${product.id}::${fragrance}` : product.id;
    setItems((current) => {
      const existing = current.find((item) => item.cartItemId === key);
      if (existing) {
        return current.map((item) =>
          item.cartItemId === key
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
            : item,
        );
      }
      return [...current, { cartItemId: key, product, quantity: Math.min(quantity, product.stock_quantity), fragrance }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((targetId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.cartItemId === targetId || item.product.id === targetId
            ? { ...item, quantity: Math.max(0, Math.min(quantity, item.product.stock_quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((targetId: string) => {
    setItems((current) => current.filter((item) => item.cartItemId !== targetId && item.product.id !== targetId));
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price_gbp * item.quantity, 0),
      isOpen,
      isReady,
      addItem,
      setQuantity,
      removeItem,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      clearCart: () => setItems([]),
    }),
    [items, isOpen, isReady, addItem, setQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useShopCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useShopCart must be used inside ShopCartProvider");
  return context;
}
