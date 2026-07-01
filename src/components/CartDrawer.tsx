"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";
import { X, Plus, Minus, Trash2, ShoppingBag, Percent, Truck, AlertCircle } from "lucide-react";
import Link from "next/link";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    couponCode,
    applyCoupon,
    discountPercentage,
    discountAmount,
    subtotal,
    total,
    couponError
  } = useCart();

  const { t, locale } = useTranslation();
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    setCouponStatus(success ? "success" : "error");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-transform animate-slide-in-right bg-white shadow-2xl flex flex-col h-full border-l border-slate-100">
          
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-accent-amber" />
              <h2 className="text-lg font-semibold tracking-wide">{t("cart.title")}</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-md text-slate-400 hover:text-white focus:outline-none transition-colors p-1 hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 font-medium">{t("cart.empty")}</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 text-sm font-semibold text-accent-amber hover:underline"
                  >
                    {t("cart.continue_shopping")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const product = item.product;
                  const price = product.promo_price || product.price;
                  const name = locale === "pt" ? product.name_pt : product.name_es;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center py-4 border-b border-slate-100 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                        <img
                          src={product.images[0]}
                          alt={name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-slate-900">
                            <h3 className="line-clamp-1 hover:text-accent-amber transition-colors">
                              <Link href={`/product/${product.slug}`} onClick={() => setIsCartOpen(false)}>
                                {name}
                              </Link>
                            </h3>
                            <p className="ml-4 font-semibold text-slate-900">
                              {formatCurrency(price * item.quantity)}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 font-mono">
                            {formatCurrency(price)} / un
                          </p>
                        </div>
                        
                        <div className="flex-1 flex items-end justify-between text-xs mt-3">
                          <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, item.quantity - 1)}
                              className="p-1 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 font-medium text-slate-700">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, item.quantity + 1)}
                              className="p-1 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer controls */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-6 bg-slate-50 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("cart.coupon_placeholder")}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm uppercase bg-white focus:outline-none focus:border-accent-amber font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  {t("cart.coupon_apply")}
                </button>
              </form>

              {couponCode && !couponError && discountAmount > 0 && (
                <p className="text-xs text-success-green flex items-center gap-1 font-bold">
                  <Percent className="w-3 h-3 text-success-green animate-bounce" /> Cupom {couponCode} aplicado com sucesso!
                </p>
              )}
              {couponError && (
                <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> {couponError}
                </p>
              )}

              {/* Subtotal, Shipping, Total */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-slate-500">
                  <p>{t("cart.subtotal")}</p>
                  <p className="font-medium text-slate-800">{formatCurrency(subtotal)}</p>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-success-green font-bold">
                    <p>Desconto ({couponCode})</p>
                    <p className="font-medium">- {formatCurrency(discountAmount)}</p>
                  </div>
                )}

                <div className="flex justify-between text-sm text-slate-500 border-b border-slate-200/60 pb-2">
                  <p className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-slate-400" /> {t("cart.shipping")}</p>
                  <p className="text-xs italic text-slate-500">{t("cart.shipping_info")}</p>
                </div>

                <div className="flex justify-between text-base font-semibold text-slate-900 pt-1">
                  <p>{t("cart.total")}</p>
                  <p className="text-lg text-slate-900 font-bold">{formatCurrency(total)}</p>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors tracking-wide"
                >
                  {t("cart.checkout_btn")}
                </Link>
              </div>

              <div className="flex justify-center text-sm text-center text-slate-500 mt-2">
                <p>
                  ou{" "}
                  <button
                    type="button"
                    className="text-accent-amber font-semibold hover:underline"
                    onClick={() => setIsCartOpen(false)}
                  >
                    {t("cart.continue_shopping")}
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
