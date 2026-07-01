"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useDB } from "@/context/DBContext";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { LeadPopup } from "@/components/LeadPopup";
import { Armchair, Gamepad2, Table, Laptop, BookOpen, Percent, ChevronDown, Check, ArrowRight, MessageSquare, ShoppingCart, Star, Heart, FileText, Tv, Plug, Clock, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const placeholderSVGChairs = (color: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(color)}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H3z"/><path d="M5 15v5"/><path d="M19 15v5"/><path d="M12 15v3"/><path d="m8 18 8 0"/></svg>`;

function HomeContent() {
  const { t, locale } = useTranslation();
  const { products, categories, promotions } = useDB();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Smart Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [onlyFreeShipping, setOnlyFreeShipping] = useState(false);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset filters when changing category
  useEffect(() => {
    setSelectedBrand("all");
    setSortBy("relevance");
    setOnlyInStock(false);
    setOnlyPromo(false);
    setOnlyFreeShipping(false);
    setMaxPrice(undefined);
  }, [activeCategory]);

  const getTimeRemaining = (endTimeStr: string) => {
    const total = Date.parse(endTimeStr) - now.getTime();
    if (total <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)));
    return { total, hours, minutes, seconds };
  };

  // Set search filter if query param exists
  useEffect(() => {
    const searchVal = searchParams.get("search");
    if (searchVal) {
      setSearchFilter(searchVal);
      setActiveCategory("all");
      setShowFilters(true); // Open filters to let them refine the search
    } else {
      setSearchFilter("");
    }
  }, [searchParams]);


  const handleExportPDFCatalog = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const localeProducts = filteredProducts.map((p) => ({
      name: locale === "pt" ? p.name_pt : p.name_es,
      description: locale === "pt" ? p.description_pt : p.description_es,
      price: formatCurrency(p.promo_price || p.price),
      category: categories.find((c) => c.id === p.category_id)?.[locale === "pt" ? "name_pt" : "name_es"] || ""
    }));

    const rowsHtml = localeProducts.map(p => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: bold; color: #0f172a;">${p.name}</td>
        <td style="padding: 12px; color: #475569;">${p.category}</td>
        <td style="padding: 12px; color: #64748b; font-size: 11px;">${p.description}</td>
        <td style="padding: 12px; font-weight: bold; color: #0f172a; text-align: right; white-space: nowrap;">${p.price}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Catálogo Muebles & Cadeiras</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; text-transform: uppercase; }
            .info { text-align: right; font-size: 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th { background: #0f172a; color: white; padding: 12px; text-align: left; font-weight: bold; text-transform: uppercase; font-size: 11px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Muebles & Cadeiras</div>
              <div style="font-size: 12px; color: #475569; font-weight: 600; margin-top: 4px;">Catálogo Oficial de Produtos - Paraguai</div>
            </div>
            <div class="info">
              <div>Contato WhatsApp: +595 981 123456</div>
              <div>Data: ${new Date().toLocaleDateString("pt-BR")}</div>
            </div>
          </div>
          
          <button class="no-print" onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px; background: #0f172a; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>

          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Produto</th>
                <th style="width: 15%;">Categoria</th>
                <th style="width: 45%;">Descrição</th>
                <th style="width: 15%; text-align: right;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            muebles.py &copy; ${new Date().getFullYear()} - Todos os direitos reservados.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 1. Get products matching category & search query
  const categoryProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category_id === activeCategory || (activeCategory === "promo" && p.promo_price);
    const name = locale === "pt" ? p.name_pt : p.name_es;
    const matchesSearch = !searchFilter.trim() || name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 2. Extract unique brands present in this subset of products for the "smart brand filter"
  const availableBrands = Array.from(
    new Set(categoryProducts.map((p) => p.brand || "").filter((b) => b !== ""))
  );

  // 3. Extract min and max prices from this subset to make price ranges/sliders dynamic
  const productPrices = categoryProducts.map((p) => p.promo_price || p.price);
  const maxAvailablePrice = productPrices.length > 0 ? Math.max(...productPrices) : 10000000;
  const minAvailablePrice = productPrices.length > 0 ? Math.min(...productPrices) : 0;

  // 4. Apply selected filters
  let filteredProducts = categoryProducts.filter((p) => {
    const activePrice = p.promo_price || p.price;
    const matchesMaxPrice = !maxPrice || activePrice <= maxPrice;
    const matchesBrand = selectedBrand === "all" || p.brand === selectedBrand;
    const matchesInStock = !onlyInStock || p.stock > 0;
    const matchesPromo = !onlyPromo || !!p.promo_price;
    const matchesFreeShipping = !onlyFreeShipping || !!p.badges?.includes("free_shipping");

    return matchesMaxPrice && matchesBrand && matchesInStock && matchesPromo && matchesFreeShipping;
  });

  // 5. Apply sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.promo_price || a.price;
    const priceB = b.promo_price || b.price;

    if (sortBy === "price_asc") {
      return priceA - priceB;
    }
    if (sortBy === "price_desc") {
      return priceB - priceA;
    }
    if (sortBy === "popularity") {
      return b.views_count - a.views_count;
    }
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0; // relevance / default order
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Armchair": return <Armchair className="w-5 h-5" />;
      case "Gamepad2": return <Gamepad2 className="w-5 h-5" />;
      case "Table": return <Table className="w-5 h-5" />;
      case "Laptop": return <Laptop className="w-5 h-5" />;
      case "BookOpen": return <BookOpen className="w-5 h-5" />;
      case "Tv": return <Tv className="w-5 h-5" />;
      case "Plug": return <Plug className="w-5 h-5" />;
      case "ShoppingCart": return <ShoppingCart className="w-5 h-5" />;
      case "Star": return <Star className="w-5 h-5" />;
      case "Heart": return <Heart className="w-5 h-5" />;
      case "Clock": return <Clock className="w-5 h-5" />;
      default: return <Armchair className="w-5 h-5" />;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleWhatsAppProduct = (p: any) => {
    const name = locale === "pt" ? p.name_pt : p.name_es;
    const text = encodeURIComponent(
      locale === "pt"
        ? `Olá! Gostaria de fazer um pedido ou obter mais informações sobre o produto: ${name} (Valor: ${formatCurrency(p.promo_price || p.price)})`
        : `¡Hola! Me gustaría hacer un pedido u obtener más información sobre o producto: ${name} (Valor: ${formatCurrency(p.promo_price || p.price)})`
    );
    window.open(`https://wa.me/595981123456?text=${text}`, "_blank");
  };

  const faqItems = [
    { qKey: "faq.q1", aKey: "faq.a1" },
    { qKey: "faq.q2", aKey: "faq.a2" },
    { qKey: "faq.q3", aKey: "faq.a3" },
    { qKey: "faq.q4", aKey: "faq.a4" },
    { qKey: "faq.q5", aKey: "faq.a5" },
    { qKey: "faq.q6", aKey: "faq.a6" },
    { qKey: "faq.q7", aKey: "faq.a7" }
  ];

  return (
    <>
      <Header />
      <CartDrawer />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 sm:py-32 font-sans">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-slate-900 filter blur-3xl opacity-50" />
        <div className="absolute right-0 bottom-0 w-120 h-120 rounded-full bg-slate-800/40 filter blur-3xl opacity-30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-slide-up text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-850 border border-slate-800 text-xs font-semibold tracking-wide text-accent-amber">
              <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
              {locale === "pt" ? "Coleção Escritório & Casa 2026" : "Colección Oficina & Hogar 2026"}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t("hero.title")}
            </h1>
            
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#produtos"
                className="px-8 py-3.5 bg-accent-amber hover:bg-amber-600 text-slate-900 rounded-md font-bold text-center transition-all shadow-lg hover:shadow-accent-amber/20 flex items-center justify-center gap-2"
              >
                <span>{t("hero.cta_products")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/595981123456"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-semibold text-center border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4.5 h-4.5 text-green-500 fill-green-500" />
                <span>{t("hero.cta_whatsapp")}</span>
              </a>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 sm:pt-10 border-t border-slate-900 max-w-md">
              <div>
                <p className="text-2xl font-bold text-white font-mono">100%</p>
                <p className="text-xs text-slate-500 mt-1">{locale === "pt" ? "Transparente" : "Transparente"}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-mono">24/48h</p>
                <p className="text-xs text-slate-500 mt-1">{locale === "pt" ? "Envio Rápido" : "Envío Rápido"}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-mono">Online</p>
                <p className="text-xs text-slate-500 mt-1">{locale === "pt" ? "Suporte Online" : "Soporte Online"}</p>
              </div>
            </div>
          </div>

          {/* Graphic mockup / preview to make layout look premium */}
          <div className="lg:col-span-5 hidden lg:flex justify-end animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 p-8 border border-slate-850 shadow-2xl relative group">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-accent-amber/10 flex items-center justify-center text-accent-amber">
                <Star className="w-5 h-5 fill-accent-amber" />
              </div>
              {/* Product isometric schema design */}
              <div className="h-64 flex items-center justify-center mb-6 relative overflow-hidden bg-slate-950/40 rounded-lg p-4">
                <img
                  src={placeholderSVGChairs("#f59e0b")}
                  alt="Premium Chair"
                  className="h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Executive Pro Chair</h3>
              <p className="text-xs text-slate-500 mb-4">Design Ergonômico de Alta Costura</p>
              <div className="flex items-center justify-between">
                <span className="text-accent-amber font-bold text-xl font-mono">Gs. 1.590.000</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">Lançamento</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 bg-white border-b border-slate-100 font-sans sticky top-[72px] sm:top-[80px] z-30 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto gap-3 pb-2.5 scrollbar-thin scrollbar-thumb-slate-300">
            <button
              onClick={() => { setActiveCategory("all"); setSearchFilter(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === "all" && !searchFilter
                  ? "bg-slate-900 text-white shadow-md scale-105"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{t("category.all")}</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchFilter(""); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{locale === "pt" ? cat.name_pt : cat.name_es}</span>
              </button>
            ))}

            <button
              onClick={() => { setActiveCategory("promo"); setSearchFilter(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === "promo"
                  ? "bg-slate-900 text-white shadow-md scale-105"
                  : "bg-slate-50 text-red-500 hover:bg-red-50"
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>{t("category.promotions")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Lightning Deals (Ofertas Relâmpago) Section */}
      {(() => {
        const lightningDeals = products.filter(
          (p) => p.countdown_end && new Date(p.countdown_end) > now && p.stock > 0
        );

        if (lightningDeals.length === 0) return null;

        return (
          <section className="py-12 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-t-2 border-b-2 border-slate-950 font-sans text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span>⚡ {locale === "pt" ? "Ofertas Relâmpago" : "Ofertas Relámpago"}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-bold">
                    {locale === "pt" ? "Preços exclusivos por tempo limitadíssimo!" : "¡Precios exclusivos por tiempo muy limitado!"}
                  </p>
                </div>
              </div>

              {/* Deals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lightningDeals.map((p) => {
                  const name = locale === "pt" ? p.name_pt : p.name_es;
                  const price = p.promo_price || p.price;
                  const time = getTimeRemaining(p.countdown_end || "");

                  return (
                    <div key={p.id} className="bg-slate-950 rounded-2xl border-2 border-slate-850 p-5 flex flex-col justify-between hover:border-accent-amber/50 transition-all shadow-xl space-y-4">
                      
                      {/* Top row */}
                      <div className="flex items-start gap-4">
                        {/* Image thumbnail */}
                        <Link href={`/product/${p.slug}`} className="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center flex-shrink-0 border border-slate-800">
                           <img src={p.images[0]} alt={name} className="max-h-full max-w-full object-contain" loading="lazy" />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-extrabold text-accent-amber uppercase tracking-wider block mb-1">
                            {p.brand || "Muebles"}
                          </span>
                          <h4 className="text-xs font-black truncate text-white leading-normal">
                            <Link href={`/product/${p.slug}`} className="hover:text-accent-amber">
                              {name}
                            </Link>
                          </h4>
                          
                          {/* Prices */}
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-sm font-black text-white font-mono">
                              {formatCurrency(price)}
                            </span>
                            <span className="text-[10px] text-slate-500 line-through font-mono">
                              {formatCurrency(p.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timer Banner */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{locale === "pt" ? "Termina em" : "Termina en"}</span>
                        </span>

                        {/* Countdown values */}
                        <div className="flex items-center gap-1 font-mono text-sm font-black text-accent-amber">
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                            {time.hours.toString().padStart(2, "0")}
                          </span>
                          <span>:</span>
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                            {time.minutes.toString().padStart(2, "0")}
                          </span>
                          <span>:</span>
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850 animate-pulse">
                            {time.seconds.toString().padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          disabled={p.stock === 0}
                          className="w-full py-2 bg-accent-amber hover:bg-amber-600 text-slate-950 rounded-lg font-black text-[10px] uppercase transition-colors tracking-wide cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
                        >
                          {locale === "pt" ? "Adicionar" : "Agregar"}
                        </button>
                        <button
                          onClick={() => handleWhatsAppProduct(p)}
                          className="w-full py-2 border border-slate-800 hover:border-slate-700 text-white rounded-lg font-black text-[10px] uppercase bg-transparent transition-colors tracking-wide cursor-pointer flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-green-500 fill-green-500" />
                          <span>WhatsApp</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Products Grid */}
      <section id="produtos" className="py-16 sm:py-24 bg-white font-sans scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {searchFilter ? `Resultados para "${searchFilter}"` : t("home.featured_products")}
            </h2>
            <p className="text-base text-slate-500">
              {searchFilter ? `${filteredProducts.length} itens encontrados` : t("home.featured_subtitle")}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-105 ${
                  showFilters 
                    ? "bg-amber-500 text-slate-950" 
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{locale === "pt" ? "Filtros Inteligentes" : "Filtros Inteligentes"}</span>
              </button>
              <button
                onClick={handleExportPDFCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold shadow-sm border border-slate-200 cursor-pointer transition-all hover:scale-105"
              >
                <FileText className="w-4 h-4 text-accent-amber" />
                <span>{locale === "pt" ? "Baixar Catálogo PDF" : "Descargar Catálogo PDF"}</span>
              </button>
            </div>
          </div>

          {/* Smart Filters Panel */}
          {showFilters && (
            <div className="bg-slate-50 rounded-2xl border-2 border-slate-950 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-800">
                {/* 1. Price Range */}
                <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>💰</span> {locale === "pt" ? "Preço Máximo" : "Precio Máximo"}
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={minAvailablePrice}
                      max={maxAvailablePrice}
                      step={50000}
                      value={maxPrice || maxAvailablePrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
                    />
                    <div className="flex justify-between font-mono font-bold text-[11px] text-slate-500">
                      <span>{formatCurrency(minAvailablePrice)}</span>
                      <span className="text-slate-900 bg-amber-200 px-1.5 py-0.5 rounded">
                        {formatCurrency(maxPrice || maxAvailablePrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Brand (Smart) */}
                <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>🏷️</span> {locale === "pt" ? "Marca" : "Marca"}
                  </h4>
                  {availableBrands.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedBrand("all")}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                          selectedBrand === "all"
                            ? "bg-slate-950 text-white border-slate-950"
                            : "bg-white text-slate-650 border-slate-200 hover:border-slate-350"
                        }`}
                      >
                        {locale === "pt" ? "Todas" : "Todas"}
                      </button>
                      {availableBrands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedBrand === brand
                              ? "bg-slate-950 text-white border-slate-950"
                              : "bg-white text-slate-650 border-slate-200 hover:border-slate-350"
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic font-medium">
                      {locale === "pt" ? "Marcas indisponíveis" : "Marcas no disponibles"}
                    </p>
                  )}
                </div>

                {/* 3. Availability and Badges */}
                <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>⚡</span> {locale === "pt" ? "Status e Envio" : "Status y Envío"}
                  </h4>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[11px] text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(e) => setOnlyInStock(e.target.checked)}
                        className="w-4 h-4 text-slate-900 accent-slate-950 border-2 border-slate-950 rounded focus:ring-0 cursor-pointer"
                      />
                      <span>{locale === "pt" ? "Apenas em estoque" : "Solo en stock"}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[11px] text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={onlyPromo}
                        onChange={(e) => setOnlyPromo(e.target.checked)}
                        className="w-4 h-4 text-slate-900 accent-slate-950 border-2 border-slate-950 rounded focus:ring-0 cursor-pointer"
                      />
                      <span>{locale === "pt" ? "Apenas promoções" : "Solo ofertas"}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[11px] text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={onlyFreeShipping}
                        onChange={(e) => setOnlyFreeShipping(e.target.checked)}
                        className="w-4 h-4 text-slate-900 accent-slate-950 border-2 border-slate-950 rounded focus:ring-0 cursor-pointer"
                      />
                      <span>{locale === "pt" ? "Frete Grátis" : "Envío Gratis"}</span>
                    </label>
                  </div>
                </div>

                {/* 4. Sorting */}
                <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>{locale === "pt" ? "Ordenar por" : "Ordenar por"}</span>
                  </h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-950 rounded focus:outline-none focus:border-accent-amber bg-white font-bold cursor-pointer"
                  >
                    <option value="relevance">{locale === "pt" ? "Relevância (Padrão)" : "Relevancia (Predet.)"}</option>
                    <option value="price_asc">{locale === "pt" ? "Preço: Menor para Maior" : "Precio: Menor a Mayor"}</option>
                    <option value="price_desc">{locale === "pt" ? "Preço: Maior para Menor" : "Precio: Mayor a Menor"}</option>
                    <option value="popularity">{locale === "pt" ? "Mais Populares" : "Más Populares"}</option>
                    <option value="newest">{locale === "pt" ? "Lançamentos" : "Lanzamientos"}</option>
                  </select>
                </div>
              </div>

              {/* Reset Filters button */}
              <div className="flex justify-end border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand("all");
                    setSortBy("relevance");
                    setOnlyInStock(false);
                    setOnlyPromo(false);
                    setOnlyFreeShipping(false);
                    setMaxPrice(undefined);
                  }}
                  className="px-4 py-1.5 border-2 border-slate-950 hover:bg-slate-100 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer"
                >
                  {locale === "pt" ? "Limpar todos os filtros" : "Limpiar todos los filtros"}
                </button>
              </div>
            </div>
          )}

          {/* Catalog grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <p className="text-slate-500 font-medium">Nenhum produto encontrado nesta categoria com estes filtros.</p>
              <button
                onClick={() => { setActiveCategory("all"); setSearchFilter(""); }}
                className="px-6 py-2 bg-slate-900 text-white rounded font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p) => {
                const name = locale === "pt" ? p.name_pt : p.name_es;
                const isPromo = !!p.promo_price;
                const activePrice = p.promo_price || p.price;
                const saving = isPromo ? p.price - (p.promo_price as number) : 0;

                return (
                  <div
                    key={p.id}
                    className="group flex flex-col justify-between bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-premium-lg transition-all duration-300 relative flex-1"
                  >
                    {/* Badge details */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                      {/* Promo badge */}
                      {(isPromo || p.badges?.includes("promo")) && (
                        <span className="bg-red-500 text-white font-bold text-[9px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider text-center">
                          {locale === "pt" ? "Oferta" : "Oferta"}
                        </span>
                      )}
                      {/* Featured badge */}
                      {(p.is_featured || p.badges?.includes("featured")) && (
                        <span className="bg-blue-500 text-white font-bold text-[9px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider text-center">
                          {locale === "pt" ? "Destaque" : "Destacado"}
                        </span>
                      )}
                      {/* Bestseller badge */}
                      {p.badges?.includes("bestseller") && (
                        <span className="bg-amber-500 text-slate-905 font-bold text-[9px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider text-center">
                          {locale === "pt" ? "Mais Vendido" : "Más Vendido"}
                        </span>
                      )}
                      {/* Free shipping badge */}
                      {p.badges?.includes("free_shipping") && (
                        <span className="bg-emerald-500 text-white font-bold text-[9px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider text-center">
                          {locale === "pt" ? "Frete Grátis" : "Envío Gratis"}
                        </span>
                      )}
                      {/* New badge */}
                      {p.badges?.includes("new") && (
                        <span className="bg-purple-500 text-white font-bold text-[9px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider text-center">
                          {locale === "pt" ? "Novo" : "Nuevo"}
                        </span>
                      )}
                      {/* Stock units warning */}
                      {(p.stock <= p.min_stock || p.badges?.includes("last_units")) && p.stock > 0 && (
                        <span className="bg-orange-500 text-white font-bold text-[9px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider animate-pulse text-center">
                          {locale === "pt" ? "Últimas Unidades" : "Últimas Unidades"}
                        </span>
                      )}
                      {p.stock === 0 && (
                        <span className="bg-slate-400 text-white font-bold text-[9px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider text-center">
                          {locale === "pt" ? "Sem Estoque" : "Sin Stock"}
                        </span>
                      )}
                    </div>

                    {/* Image Area */}
                    <Link
                      href={`/product/${p.slug}`}
                      className="h-64 flex items-center justify-center p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors relative"
                    >
                      <img
                        src={p.images[0]}
                        alt={name}
                        className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          {categories.find((c) => c.id === p.category_id)?.[locale === "pt" ? "name_pt" : "name_es"] || ""}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-accent-amber transition-colors">
                          <Link href={`/product/${p.slug}`}>
                            {name}
                          </Link>
                        </h3>

                        {/* Price Row */}
                        <div className="pt-1.5 flex flex-wrap items-baseline gap-1.5 font-sans">
                          <span className="text-base font-extrabold text-slate-900">
                            {formatCurrency(activePrice)}
                          </span>
                          {isPromo && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(p.price)}
                            </span>
                          )}
                        </div>

                        {isPromo && (
                          <p className="text-[11px] text-emerald-500 font-semibold">
                            {t("product.saving")} {formatCurrency(saving)}
                          </p>
                        )}
                      </div>

                      {/* Buy Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-5">
                        <button
                          onClick={() => addToCart(p, 1)}
                          disabled={p.stock === 0}
                          className="flex items-center justify-center gap-1 bg-slate-900 text-white py-2 rounded-md font-semibold text-xs hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{t("product.button_buy").split(" ")[0]}</span>
                        </button>
                        <button
                          onClick={() => handleWhatsAppProduct(p)}
                          className="flex items-center justify-center gap-1 border border-slate-200 text-slate-700 py-2 rounded-md font-semibold text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors bg-white cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-16 sm:py-24 bg-slate-50 border-t border-b border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t("home.how_it_works")}
            </h2>
            <p className="text-base text-slate-500">
              {locale === "pt"
                ? "Criamos um processo extremamente simples, rápido e transparente para você comprar com total tranquilidade."
                : "Creamos un proceso extremadamente simple, rápido y transparente para que compres con total tranquilidad."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative group hover:-translate-y-1 transition-all duration-300">
              <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4">1</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("home.how_step1_title").split(".")[1]}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t("home.how_step1_desc")}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative group hover:-translate-y-1 transition-all duration-300">
              <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4">2</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("home.how_step2_title").split(".")[1]}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t("home.how_step2_desc")}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative group hover:-translate-y-1 transition-all duration-300">
              <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4">3</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("home.how_step3_title").split(".")[1]}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t("home.how_step3_desc")}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative group hover:-translate-y-1 transition-all duration-300">
              <span className="w-10 h-10 rounded-full bg-accent-amber text-slate-900 flex items-center justify-center font-bold text-sm mb-4">4</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("home.how_step4_title").split(".")[1]}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t("home.how_step4_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 sm:py-24 bg-white font-sans scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t("faq.title")}
            </h2>
            <p className="text-base text-slate-500">
              {locale === "pt" ? "Respostas rápidas para as dúvidas mais comuns." : "Respuestas rápidas para las dudas más comunes."}
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200/80 rounded-xl overflow-hidden hover:border-slate-300 transition-colors bg-white shadow-sm"
                >
                  <button
                    onClick={() => handleFaqToggle(index)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left font-bold text-slate-800 hover:text-accent-amber transition-colors text-sm sm:text-base cursor-pointer"
                  >
                    <span>{t(item.qKey)}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-accent-amber" : ""}`} />
                  </button>
                  
                  <div
                    className={`transition-all duration-350 overflow-hidden ${isOpen ? "max-h-60 border-t border-slate-100 bg-slate-50/50" : "max-h-0"}`}
                  >
                    <div className="px-6 py-4.5 text-sm text-slate-600 leading-relaxed">
                      {t(item.aKey)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-slate-950 text-white font-sans text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t("home.cta_final_title")}
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t("home.cta_final_desc")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="#produtos"
              className="px-8 py-3.5 bg-accent-amber hover:bg-amber-600 text-slate-900 rounded-md font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{t("hero.cta_products")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/595981123456"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4.5 h-4.5 text-green-500 fill-green-500" />
              <span>{t("hero.cta_whatsapp")}</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <LeadPopup />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-sans text-slate-500">Carregando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
