"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export const WhatsAppButton: React.FC = () => {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const [showBubble, setShowBubble] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    // Check if the user already closed the bubble during this session
    const isClosed = sessionStorage.getItem("whatsapp_bubble_closed");
    if (isClosed === "true") {
      setHasClosed(true);
      return;
    }

    // Auto-show bubble after 4 seconds
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBubble(false);
    setHasClosed(true);
    sessionStorage.setItem("whatsapp_bubble_closed", "true");
  };

  const whatsappUrl = "https://wa.me/595973953874";

  // Content based on locale
  const greeting =
    locale === "pt"
      ? "Olá! Precisa de ajuda para escolher seus móveis?"
      : "¡Hola! ¿Necesitas ayuda para elegir tus muebles?";
  
  const ctaText =
    locale === "pt"
      ? "Fale conosco no WhatsApp"
      : "Hable con nosotros por WhatsApp";

  const tooltipText =
    locale === "pt" ? "Falar no WhatsApp" : "Hablar por WhatsApp";

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Floating Chat Bubble */}
      {showBubble && !hasClosed && (
        <div className="relative mb-3.5 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-premium-lg border border-slate-100 p-4 transition-all duration-300 pointer-events-auto animate-slide-up">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Chat Content */}
          <div className="flex gap-3">
            {/* Avatar with Online indicator */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                WA
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            </div>

            <div className="pr-4 flex-1">
              <span className="block text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                Atendimento
              </span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {greeting}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2.5 text-xs font-bold text-emerald-500 hover:text-emerald-600 hover:underline transition-colors"
              >
                {ctaText} &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 bg-gradient-to-tr from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white shadow-premium-lg hover:shadow-green-500/35 hover:scale-108 active:scale-95 transition-all duration-300 group pointer-events-auto cursor-pointer"
        title={tooltipText}
      >
        {/* Pulsing ring background */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping opacity-75 -z-10 pointer-events-none" />

        {/* WhatsApp SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-7 h-7 fill-current transition-transform duration-300 group-hover:rotate-12"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L32 503l133.9-35.2c32.7 17.8 69.4 27.2 106.8 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-64.9-157c-21.3-21.3-49.5-33-79.6-33zm-157 348.7c-33.2 0-65.7-8.9-94-25.7l-6.7-4-79.8 20.9 21.3-77.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-82.8 184.6-184.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>

        {/* Small Notification Alert Badge */}
        <span className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-rose-500 border border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-bounce group-hover:animate-none">
          1
        </span>

        {/* Desktop Tooltip */}
        <span className="absolute right-full mr-3 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap hidden sm:block">
          {tooltipText}
        </span>
      </a>
    </div>
  );
};
