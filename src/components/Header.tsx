"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useDB } from "@/context/DBContext";
import { ShoppingCart, Search, Menu, X, Phone, ShieldCheck, Truck, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const { t, locale, setLocale } = useTranslation();
  const { cart, setIsCartOpen } = useCart();
  const { products } = useDB();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchRef = useRef<HTMLFormElement>(null);

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = products.filter((p) => {
      const name = locale === "pt" ? p.name_pt : p.name_es;
      return name.toLowerCase().includes(query);
    }).slice(0, 5); // Max 5 suggestions
    setSearchSuggestions(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, locale]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to product if there is a match or just redirect
      const match = products.find((p) => {
        const name = locale === "pt" ? p.name_pt : p.name_es;
        return name.toLowerCase() === searchQuery.toLowerCase();
      });
      if (match) {
        router.push(`/product/${match.slug}`);
      } else {
        // Go to catalog search (we'll implement catalog filtration dynamically in the home page)
        router.push(`/#produtos?search=${encodeURIComponent(searchQuery)}`);
      }
      setIsSearchFocused(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="w-full bg-slate-900 text-white text-[11px] sm:text-xs py-2.5 px-4 font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <div className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-accent-amber" />
            <span>{t("topbar.delivery")}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-amber" />
              <span>{t("topbar.secure")}</span>
            </div>
            <a
              href="https://wa.me/595973953874"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-accent-amber transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-green-500" />
              <span>+595 973953874</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header navigation */}
      <header className="w-full sticky top-0 glass-nav shadow-sm border-b border-slate-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <span className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white tracking-tighter text-lg shadow-md group-hover:bg-accent-amber transition-colors duration-300">
              M
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">
              Muebles<span className="text-accent-amber font-extrabold font-mono">.py</span>
            </span>
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            ref={searchRef}
            className="hidden md:flex flex-1 max-w-lg relative"
          >
            <div className="w-full relative">
              <input
                type="text"
                placeholder={locale === "pt" ? "Buscar cadeiras, mesas, estantes..." : "Buscar sillas, mesas, estanterías..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-accent-amber focus:ring-1 focus:ring-accent-amber text-sm text-slate-900 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent-amber transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50 py-1.5 animate-fade-in max-h-72 overflow-y-auto">
                {searchSuggestions.map((prod) => {
                  const name = locale === "pt" ? prod.name_pt : prod.name_es;
                  return (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors gap-3"
                    >
                      <img src={prod.images[0]} alt={name} className="w-8 h-8 object-contain rounded bg-slate-50 border border-slate-100 p-0.5" loading="lazy" />
                      <div className="flex-1">
                        <span className="text-sm text-slate-900 font-medium line-clamp-1">{name}</span>
                        <span className="text-[10px] text-slate-400">
                          {prod.promo_price ? (
                            <>
                              <span className="text-slate-900 font-semibold mr-1.5">
                                Gs. {prod.promo_price.toLocaleString("es-PY")}
                              </span>
                              <span className="line-through">Gs. {prod.price.toLocaleString("es-PY")}</span>
                            </>
                          ) : (
                            <span>Gs. {prod.price.toLocaleString("es-PY")}</span>
                          )}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            )}
          </form>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-accent-amber transition-colors">{t("nav.home")}</Link>
            <Link href="/#produtos" className="hover:text-accent-amber transition-colors">{t("nav.products")}</Link>
            <Link href="/#faq" className="hover:text-accent-amber transition-colors">FAQ</Link>
            <Link href="/admin" className="text-slate-500 hover:text-accent-amber flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 transition-colors">
              <User className="w-3.5 h-3.5" />
              <span>{t("nav.admin")}</span>
            </Link>
          </nav>

          {/* Actions: Lang, Cart, Menu */}
          <div className="flex items-center space-x-3.5">
            {/* Language Switcher */}
            <div className="flex items-center border border-slate-200 rounded-full px-2 py-1 bg-slate-50 text-[11px] font-bold space-x-1.5 shadow-sm">
              <button
                onClick={() => setLocale("pt")}
                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all ${
                  locale === "pt"
                    ? "bg-slate-900 text-white scale-110 shadow-sm"
                    : "text-slate-400 hover:text-slate-700 hover:scale-105"
                }`}
                title="Português"
              >
                🇧🇷
              </button>
              <button
                onClick={() => setLocale("es")}
                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all ${
                  locale === "es"
                    ? "bg-slate-900 text-white scale-110 shadow-sm"
                    : "text-slate-400 hover:text-slate-700 hover:scale-105"
                }`}
                title="Español"
              >
                🇵🇾
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-accent-amber transition-colors rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100 shadow-sm bg-white"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-[10px] text-white flex items-center justify-center font-bold font-mono shadow-md animate-pulse-slow">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-slate-700 hover:text-accent-amber transition-colors rounded-full bg-slate-50 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-100 bg-white/95 backdrop-blur-md px-4 py-5 space-y-4 animate-fade-in shadow-lg absolute w-full z-30 left-0">
          {/* Search bar inside mobile drawer */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={locale === "pt" ? "Buscar..." : "Buscar..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-accent-amber text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Links */}
          <nav className="flex flex-col space-y-3.5 text-base font-semibold text-slate-800">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-accent-amber transition-colors pb-1 border-b border-slate-100"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/#produtos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-accent-amber transition-colors pb-1 border-b border-slate-100"
            >
              {t("nav.products")}
            </Link>
            <Link
              href="/#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-accent-amber transition-colors pb-1 border-b border-slate-100"
            >
              FAQ
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-accent-amber transition-colors flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
            >
              <User className="w-4.5 h-4.5" />
              <span>{t("nav.admin")}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  </>
  );
};

export default Header;
