"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, Percent, Truck } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    couponCode,
    applyCoupon,
    discountPercentage,
    subtotal,
    total
  } = useCart();

  const { t, locale } = useTranslation();
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");

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
    <>
      <Header />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">{t("cart.title")}</h1>

        {cart.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">{t("cart.empty")}</p>
            <Link href="/" className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded font-semibold text-sm hover:bg-slate-800 transition-colors">
              {t("cart.continue_shopping")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Items list */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm divide-y divide-slate-100">
              {cart.map((item) => {
                const product = item.product;
                const name = locale === "pt" ? product.name_pt : product.name_es;
                const price = product.promo_price || product.price;

                return (
                  <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center py-5 first:pt-0 last:pb-0 gap-4">
                    <div className="w-18 h-18 bg-slate-50 rounded border p-1 flex items-center justify-center flex-shrink-0">
                      <img src={product.images[0]} alt={name} className="max-h-full max-w-full object-contain" loading="lazy" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-950 truncate hover:text-accent-amber transition-colors">
                        <Link href={`/product/${product.slug}`}>{name}</Link>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatCurrency(price)} / un</p>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 font-semibold text-sm text-slate-700 font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="font-extrabold text-sm text-slate-900 font-mono min-w-24 text-right">
                        {formatCurrency(price * item.quantity)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remover do Carrinho"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Card Summary (Right Column) */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                {t("cart.summary")}
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("cart.coupon_placeholder")}
                  className="flex-1 px-3 py-2 border border-slate-250 rounded text-xs uppercase bg-white focus:outline-none focus:border-accent-amber font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  {t("cart.coupon_apply")}
                </button>
              </form>

              {couponStatus === "success" && (
                <p className="text-xs text-success-green font-medium flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> Cupom aplicado! -{discountPercentage}% de desconto.
                </p>
              )}
              {couponStatus === "error" && (
                <p className="text-xs text-red-500">Cupom inválido. Tente MUEBLES10 ou OFFER20.</p>
              )}

              {/* Summary calculations */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-success-green">
                    <span>Desconto ({discountPercentage}%)</span>
                    <span className="font-bold">- {formatCurrency(subtotal * (discountPercentage / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 border-b border-slate-200/60 pb-2.5">
                  <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-slate-400" /> {t("cart.shipping")}</span>
                  <span className="font-semibold text-slate-700 italic">{t("cart.shipping_info")}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                  <span>{t("cart.total")}</span>
                  <span className="text-slate-900 font-black">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-lg font-bold text-sm transition-colors shadow-md tracking-wider text-center"
                >
                  {t("cart.checkout_btn")}
                </Link>
                
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-1.5 px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold text-xs transition-colors bg-white text-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{locale === "pt" ? "Adicionar mais móveis" : "Agregar más muebles"}</span>
                </Link>
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
