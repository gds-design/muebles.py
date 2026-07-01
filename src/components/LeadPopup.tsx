"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { X, Send, Gift, Copy, Check } from "lucide-react";

export const LeadPopup: React.FC = () => {
  const { t, locale } = useTranslation();
  
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if the user already dismissed or registered
    const dismissed = localStorage.getItem("muebles_lead_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // 5 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("muebles_lead_dismissed", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Save lead in localStorage (mock database)
    const existingLeadsStr = localStorage.getItem("muebles_leads");
    let leads = [];
    if (existingLeadsStr) {
      try {
        leads = JSON.parse(existingLeadsStr);
      } catch (err) {}
    }
    
    const newLead = {
      id: "lead-" + Date.now(),
      name,
      email: email || "não-informado",
      phone,
      created_at: new Date().toISOString()
    };
    
    leads.push(newLead);
    localStorage.setItem("muebles_leads", JSON.stringify(leads));
    localStorage.setItem("muebles_lead_dismissed", "true");

    setStep("success");
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText("MUEBLES10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden relative transform scale-100 transition-all duration-300 animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2.5">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-accent-amber mx-auto shadow-sm">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {locale === "pt" ? "Ganhe 10% de Desconto!" : "¡Obtén 10% de Descuento!"}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {locale === "pt"
                  ? "Cadastre-se para receber ofertas exclusivas e garanta um cupom de 10% OFF para sua primeira compra no site ou WhatsApp!"
                  : "¡Regístrate para recibir ofertas exclusivas y garantiza un cupón de 10% OFF para tu primera compra en la web o WhatsApp!"}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">
                  {locale === "pt" ? "Nome Completo" : "Nombre Completo"} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Juan Perez"
                  className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 bg-slate-50/50 focus:outline-none focus:border-accent-amber"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +595 981 123456"
                  className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 bg-slate-50/50 focus:outline-none focus:border-accent-amber"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: juan@email.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 bg-slate-50/50 focus:outline-none focus:border-accent-amber"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{locale === "pt" ? "Garantir Cupom de Desconto" : "Garantizar Cupón de Descuento"}</span>
            </button>
          </form>
        ) : (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-success-green mx-auto shadow-sm">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {locale === "pt" ? "Cadastro Realizado!" : "¡Registro Realizado!"}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {locale === "pt"
                  ? "Use o cupom abaixo no seu carrinho ou mencione-o ao finalizar seu pedido pelo WhatsApp."
                  : "Usa el cupón de abajo en tu carrito o menciónalo al finalizar tu pedido por WhatsApp."}
              </p>
            </div>

            {/* Coupon display card */}
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2.5">
              <span className="font-mono text-xl font-black text-slate-800 tracking-wider">MUEBLES10</span>
              <button
                onClick={copyCoupon}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-amber hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-success-green" />
                    <span className="text-success-green">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {locale === "pt" ? "Começar a Comprar" : "Empezar a Comprar"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
export default LeadPopup;
