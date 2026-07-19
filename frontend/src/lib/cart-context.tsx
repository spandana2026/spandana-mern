import React, { createContext, useContext, useEffect, useState } from "react";
import type { ShopProduct } from "@workspace/api-client-react";

export interface CartItem {
  product: ShopProduct;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ShopProduct, qty: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("spandana-cart");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("spandana-cart", JSON.stringify(items));
  }, [items, isLoaded]);

  const addToCart = (product: ShopProduct, qty: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
  };

  const updateQty = (productId: string, qty: number) =>
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));

  const removeFromCart = (productId: string) =>
    setItems(prev => prev.filter(i => i.product.id !== productId));

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
