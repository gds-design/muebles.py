"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, useDB } from "./DBContext";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discountPercentage: number;
  discountAmount: number;
  applyCoupon: (code: string) => boolean;
  subtotal: number;
  total: number;
  couponError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { coupons } = useDB();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("muebles_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    }
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("muebles_cart", JSON.stringify(updatedCart));
  };

  const addToCart = (product: Product, qty: number = 1) => {
    const updated = [...cart];
    const existingIndex = updated.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      updated[existingIndex].quantity += qty;
    } else {
      updated.push({ product, quantity: qty });
    }

    saveCart(updated);
    setIsCartOpen(true); // Open slide drawer immediately on add to cart
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode("");
    setCouponError(null);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.promo_price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Find active coupon and compute discount
  const activeCoupon = coupons.find(
    (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active
  );

  let discountPercentage = 0;
  let discountAmount = 0;
  let computedCouponError: string | null = null;

  if (activeCoupon) {
    // Validate expiration
    if (activeCoupon.expires_at && new Date(activeCoupon.expires_at) < new Date()) {
      computedCouponError = "Cupom expirado.";
    }
    // Validate max uses
    else if (activeCoupon.max_uses && activeCoupon.usage_count >= activeCoupon.max_uses) {
      computedCouponError = "Cupom esgotado.";
    }
    // Validate minimum purchase
    else if (activeCoupon.min_purchase && subtotal < activeCoupon.min_purchase) {
      computedCouponError = `Compra mínima de Gs. ${new Intl.NumberFormat("es-PY").format(activeCoupon.min_purchase)} necessária.`;
    } 
    // Apply discount
    else {
      if (activeCoupon.type === "percentage") {
        discountPercentage = activeCoupon.value;
        discountAmount = subtotal * (activeCoupon.value / 100);
      } else {
        discountAmount = activeCoupon.value;
      }
    }
  }

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.toUpperCase().trim();
    setCouponCode(cleanCode);

    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.active);
    if (!found) {
      setCouponError("Cupom inválido ou inativo.");
      return false;
    }

    if (found.expires_at && new Date(found.expires_at) < new Date()) {
      setCouponError("Este cupom já expirou.");
      return false;
    }

    if (found.max_uses && found.usage_count >= found.max_uses) {
      setCouponError("Este cupom atingiu o limite de usos.");
      return false;
    }

    if (found.min_purchase && subtotal < found.min_purchase) {
      setCouponError(`Compra mínima de Gs. ${new Intl.NumberFormat("es-PY").format(found.min_purchase)} necessária.`);
      return false;
    }

    setCouponError(null);
    return true;
  };

  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        setCouponCode,
        discountPercentage,
        discountAmount,
        applyCoupon,
        subtotal,
        total,
        couponError: couponError || computedCouponError
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
