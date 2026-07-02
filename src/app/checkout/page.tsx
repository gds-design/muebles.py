"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useDB } from "@/context/DBContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ShieldCheck, ArrowLeft, Send, CheckCircle, Smartphone, MapPin, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CheckoutContent() {
  const { t, locale } = useTranslation();
  const { cart, subtotal, total, discountPercentage, discountAmount, couponCode, clearCart } = useCart();
  const { createOrder, products } = useDB();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Asunción",
    address: "",
    notes: ""
  });

  const [isQuoteRequest, setIsQuoteRequest] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [quoteItems, setQuoteItems] = useState<any[]>([]);

  // Capture params for single item quote request
  useEffect(() => {
    const isQuote = searchParams.get("quote") === "true";
    const prodId = searchParams.get("prod");
    const qty = parseInt(searchParams.get("qty") || "1");

    if (isQuote) {
      setIsQuoteRequest(true);
      if (prodId) {
        const matchedProduct = products.find((p) => p.id === prodId);
        if (matchedProduct) {
          setQuoteItems([{ product: matchedProduct, quantity: qty }]);
        }
      }
    } else {
      setIsQuoteRequest(false);
      setQuoteItems([]);
    }
  }, [searchParams, products]);

  const activeItems = isQuoteRequest ? quoteItems : cart;

  const activeSubtotal = isQuoteRequest
    ? activeItems.reduce((sum, item) => sum + (item.product.promo_price || item.product.price) * item.quantity, 0)
    : subtotal;

  const activeTotal = isQuoteRequest
    ? activeSubtotal
    : total;

  // Save/Update Abandoned Cart in localStorage
  useEffect(() => {
    if (activeItems.length > 0 && (formData.name || formData.phone || formData.email)) {
      const saved = localStorage.getItem("muebles_abandoned_carts");
      let list = [];
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (e) {}
      }

      let sessionId = sessionStorage.getItem("checkout_session_id");
      if (!sessionId) {
        sessionId = "cart-ab-" + Date.now();
        sessionStorage.setItem("checkout_session_id", sessionId);
      }

      const existingIndex = list.findIndex((c: any) => c.id === sessionId);
      const cartData = {
        id: sessionId,
        customer_name: formData.name || "Visitante",
        customer_phone: formData.phone || "",
        customer_email: formData.email || "",
        items: activeItems.map((item) => ({
          product_id: item.product.id,
          name_pt: item.product.name_pt,
          qty: item.quantity,
          price: item.product.promo_price || item.product.price
        })),
        total_amount: activeTotal,
        updated_at: new Date().toISOString()
      };

      if (existingIndex > -1) {
        list[existingIndex] = cartData;
      } else {
        list.push(cartData);
      }
      localStorage.setItem("muebles_abandoned_carts", JSON.stringify(list));
    }
  }, [formData, activeItems, activeTotal]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildWhatsAppMessage = (orderNum: number) => {
    const title = isQuoteRequest ? "*SOLICITAÇÃO DE ORÇAMENTO*" : "*NOVO PEDIDO DE COMPRA*";
    const border = "----------------------------------";
    const isFreeShipping = formData.city === "Ciudad del Este" || formData.city === "Minga Guazú";
    const shippingText = isFreeShipping
      ? (locale === "pt" ? "Grátis (Ciudad del Este / Minga Guazú)" : "Gratis (Ciudad del Este / Minga Guazú)")
      : (locale === "pt" ? "A combinar" : "A acordar");

    const clientDetails = [
      `*Cliente:* ${formData.name}`,
      `*Telefone:* ${formData.phone}`,
      `*E-mail:* ${formData.email}`,
      `*Cidade:* ${formData.city}`,
      `*Endereço:* ${formData.address}`,
      `*Frete:* ${shippingText}`,
      formData.notes ? `*Observações:* ${formData.notes}` : null
    ].filter(Boolean).join("\n");

    const itemDetails = activeItems.map((item) => {
      const pName = locale === "pt" ? item.product.name_pt : item.product.name_es;
      const price = item.product.promo_price || item.product.price;
      return `• ${item.quantity}x ${pName} (${formatCurrency(price)})`;
    }).join("\n");

    const discountText = discountAmount > 0
      ? `*Desconto (${couponCode}):* - ${formatCurrency(discountAmount)}\n`
      : "";

    const finance = isQuoteRequest
      ? `*Total Estimado:* ${formatCurrency(activeTotal)}`
      : `*Subtotal:* ${formatCurrency(activeSubtotal)}\n` +
        discountText +
        `*Total:* ${formatCurrency(activeTotal)}`;

    const text = encodeURIComponent(
      `${title}\n` +
      `*Nº:* #${orderNum}\n` +
      `${border}\n` +
      `${clientDetails}\n` +
      `${border}\n` +
      `*Itens:*\n` +
      `${itemDetails}\n` +
      `${border}\n` +
      `${finance}\n` +
      `${border}\n` +
      (locale === "pt"
        ? `Por favor, confirme a disponibilidade e o prazo de entrega.`
        : `Por favor, confirme la disponibilidad y el tiempo de entrega.`)
    );

    return `https://wa.me/595973953874?text=${text}`;
  };

  const handleSubmit = (type: "site" | "whatsapp") => {
    // Validate inputs
    if (!formData.name || !formData.phone || !formData.address) {
      alert(locale === "pt" ? "Por favor, preencha nome, telefone e endereço." : "Por favor, complete nombre, teléfono y dirección.");
      return;
    }

    const orderPayload = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_email: formData.email || "não-informado@muebles.com.py",
      city: formData.city,
      address: formData.address,
      notes: formData.notes,
      status: "Novo" as const,
      total_amount: activeTotal,
      payment_method: type === "whatsapp" ? "WhatsApp" : "Site Checkout",
      items: activeItems.map((item) => ({
        product_id: item.product.id,
        name_pt: item.product.name_pt,
        name_es: item.product.name_es,
        qty: item.quantity,
        price: item.product.promo_price || item.product.price
      })),
      coupon_code: isQuoteRequest ? undefined : (couponCode || undefined),
      discount_amount: isQuoteRequest ? undefined : (discountAmount || undefined)
    };

    const savedOrder = createOrder(orderPayload);
    setOrderSuccess(savedOrder);

    if (type === "whatsapp") {
      const waUrl = buildWhatsAppMessage(savedOrder.order_number);
      window.open(waUrl, "_blank");
    }

    // Clear cart if direct order was made (non-quote)
    if (!isQuoteRequest) {
      clearCart();
    }

    // Remove from abandoned carts
    const sessionId = sessionStorage.getItem("checkout_session_id");
    if (sessionId) {
      const saved = localStorage.getItem("muebles_abandoned_carts");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          const filtered = list.filter((c: any) => c.id !== sessionId);
          localStorage.setItem("muebles_abandoned_carts", JSON.stringify(filtered));
          sessionStorage.removeItem("checkout_session_id");
        } catch (e) {}
      }
    }
  };

  // Success view
  if (orderSuccess) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-4 py-16 font-sans text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-success-green flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t("checkout.success_title")}
            </h1>
            <p className="text-slate-500 font-mono text-sm">
              {locale === "pt" ? `Código do pedido: #${orderSuccess.order_number}` : `Código del pedido: #${orderSuccess.order_number}`}
            </p>
          </div>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t("checkout.success_desc")}
          </p>

          <div className="pt-4 flex flex-col gap-3">
            <a
              href={buildWhatsAppMessage(orderSuccess.order_number)}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-md font-bold text-sm hover:bg-green-600 transition-colors shadow-lg"
            >
              <Smartphone className="w-4.5 h-4.5 fill-white" />
              <span>{t("checkout.whatsapp_redirect")}</span>
            </a>
            <Link
              href="/"
              className="w-full text-center py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md font-semibold text-sm transition-colors bg-white"
            >
              {locale === "pt" ? "Voltar à Loja" : "Volver a la Tienda"}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={isQuoteRequest && quoteItems.length > 0 ? `/product/${quoteItems[0].product.slug}` : "/"}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === "pt" ? "Voltar" : "Volver"}</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-8">
          {isQuoteRequest
            ? (locale === "pt" ? "Solicitar Orçamento Formal" : "Solicitar Presupuesto Formal")
            : t("checkout.title")}
        </h1>

        {activeItems.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto space-y-4">
            <p className="text-slate-500">{locale === "pt" ? "Seu carrinho está vazio para checkout." : "Tu carrito está vacío para finalizar compra."}</p>
            <Link href="/" className="px-6 py-2 bg-slate-900 text-white rounded text-sm font-semibold">
              Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left side Checkout Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ClipboardList className="w-4.5 h-4.5 text-accent-amber" />
                  <span>{t("checkout.personal_info")}</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">{t("checkout.name")} *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Juan Perez"
                      className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-accent-amber bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">{t("checkout.phone")} *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: +595 973 953874"
                      className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-accent-amber bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">{t("checkout.email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="juan@email.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-accent-amber bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MapPin className="w-4.5 h-4.5 text-accent-amber" />
                  <span>{t("checkout.delivery_info")}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">{t("checkout.city")} *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-sm bg-slate-50/50 focus:outline-none focus:border-accent-amber"
                    >
                      <option value="Asunción">Asunción (Gran Asunción)</option>
                      <option value="Ciudad del Este">Ciudad del Este (Frete Grátis / Envío Gratis)</option>
                      <option value="Minga Guazú">Minga Guazú (Frete Grátis / Envío Gratis)</option>
                      <option value="Encarnación">Encarnación</option>
                      <option value="Luque">Luque</option>
                      <option value="San Lorenzo">San Lorenzo</option>
                      <option value="Lambaré">Lambaré</option>
                      <option value="Fernando de la Mora">Fernando de la Mora</option>
                      <option value="Outra / Región Remota">Outra Região (Paraguay)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">{t("checkout.address")} *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Ex: Av. España 1234 c/ Brasil"
                      className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-accent-amber bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">{t("checkout.notes")}</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder={locale === "pt" ? "Ex: Entregar após as 14h, campainha preta..." : "Ej: Entregar después de las 14h, timbre negro..."}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-accent-amber bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Action checkout buttons */}
              <div className="pt-4 space-y-3.5">
                <button
                  onClick={() => handleSubmit("whatsapp")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-green-500/10 cursor-pointer"
                >
                  <Smartphone className="w-4.5 h-4.5 fill-white" />
                  <span>{t("checkout.place_whatsapp")}</span>
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSubmit("site")}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t("checkout.place_order")}
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.name || !formData.phone) {
                        alert("Preencha Nome e Telefone para solicitar o orçamento.");
                        return;
                      }
                      setIsQuoteRequest(true);
                      handleSubmit("site");
                    }}
                    className="w-full border border-slate-200 text-slate-600 py-3 rounded-lg font-semibold text-xs hover:bg-slate-50 transition-colors bg-white cursor-pointer"
                  >
                    {t("checkout.quote_btn")}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                  <span>{t("checkout.secure_note")}</span>
                </p>
              </div>

            </div>

            {/* Right side Checkout Summary */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                {t("cart.summary")}
              </h2>

              {/* Items List */}
              <div className="space-y-4 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {activeItems.map((item) => {
                  const pName = locale === "pt" ? item.product.name_pt : item.product.name_es;
                  const price = item.product.promo_price || item.product.price;

                  return (
                    <div key={item.product.id} className="flex items-center gap-4 pt-4 first:pt-0">
                      <div className="w-12 h-12 bg-white rounded border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                        <img src={item.product.images[0]} alt={pName} className="max-h-full max-w-full object-contain" loading="lazy" />
                      </div>
                      <div className="flex-1 text-xs">
                        <h4 className="font-bold text-slate-800 line-clamp-1">{pName}</h4>
                        <p className="text-slate-400 font-mono mt-0.5">{item.quantity}x {formatCurrency(price)}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {formatCurrency(price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Financial calculations */}
              <div className="border-t border-slate-200 pt-4 space-y-3.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-bold text-slate-800">{formatCurrency(activeSubtotal)}</span>
                </div>
                {discountAmount > 0 && !isQuoteRequest && (
                  <div className="flex justify-between text-xs text-success-green font-bold">
                    <span>Desconto ({couponCode})</span>
                    <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t("cart.shipping")}</span>
                  {(() => {
                    const isFreeShipping = formData.city === "Ciudad del Este" || formData.city === "Minga Guazú";
                    return (
                      <span className={isFreeShipping ? "font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1" : "font-semibold text-slate-700 italic"}>
                        {isFreeShipping ? (locale === "pt" ? "🚚 Grátis" : "🚚 Gratis") : t("cart.shipping_info")}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-3">
                  <span>{t("cart.total")}</span>
                  <span className="text-slate-900 font-black">{formatCurrency(activeTotal)}</span>
                </div>
              </div>

              {/* Note on manual coordination */}
              <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 text-[11px] text-amber-700 leading-relaxed">
                {locale === "pt"
                  ? "Nosso atendimento é humanizado. Assim que enviar o pedido, entraremos em contato via WhatsApp para definir os detalhes de pagamento, frete e agendamento de entrega."
                  : "Nuestra atención es humanizada. Tan pronto como envíe el pedido, nos pondremos en contacto vía WhatsApp para acordar los detalles de pago, envío y agenda de entrega."}
              </div>

            </div>

          </div>
        )}

      </main>
      <Footer />
    </>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-sans text-slate-500">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
