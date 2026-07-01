"use client";

import React, { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { Phone, Mail, Shield, CheckCircle, Send, Heart, ArrowUp } from "lucide-react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const { t, locale } = useTranslation();
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="footer" className="bg-slate-900 text-slate-300 font-sans border-t border-slate-800">
      
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* About & Branding */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-slate-900 tracking-tighter text-base">
              M
            </span>
            <span className="text-base font-bold tracking-tight text-white uppercase">
              Muebles<span className="text-accent-amber font-extrabold font-mono">.py</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed pt-1.5">
            {locale === "pt"
              ? "Especialistas em móveis de alto padrão e cadeiras ergonômicas para transformar seus ambientes de casa e escritório."
              : "Especialistas en muebles de alto nivel y sillas ergonómicas para transformar tus espacios del hogar y la oficina."}
          </p>
          <div className="flex items-center gap-3 pt-3">
            <Shield className="w-5 h-5 text-accent-amber" />
            <span className="text-xs text-slate-400 font-medium">Compra 100% Protegida & Garantida</span>
          </div>
        </div>

        {/* Contact Info & Maps */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
            {locale === "pt" ? "Contato & Showroom" : "Contacto & Showroom"}
          </h3>
          <ul className="space-y-3.5 text-sm text-slate-400">
            <li className="flex items-center gap-2.5">
              <Phone className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
              <a href="https://wa.me/595981123456" target="_blank" rel="noreferrer" className="hover:text-accent-amber transition-colors">
                +595 981 123456
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
              <a href="mailto:contato@muebles.com.py" className="hover:text-accent-amber transition-colors">
                contato@muebles.com.py
              </a>
            </li>
          </ul>
        </div>

        {/* Areas Served & Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
            {locale === "pt" ? "Área de Atendimento" : "Área de Cobertura"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {locale === "pt" ? (
              <>
                Entregamos em todo o departamento de <strong className="text-white font-semibold">Alto Paraná</strong>. Oferecemos <strong className="text-accent-amber font-semibold">Frete Grátis</strong> especial para as cidades de <strong className="text-white font-semibold">Ciudad del Este</strong> e <strong className="text-white font-semibold">Minga Guazú</strong>. Outras localidades sob consulta de envio.
              </>
            ) : (
              <>
                Entregamos en todo el departamento de <strong className="text-white font-semibold">Alto Paraná</strong>. ¡Ofrecemos <strong className="text-accent-amber font-semibold">Envío Gratis</strong> especial para las ciudades de <strong className="text-white font-semibold">Ciudad del Este</strong> y <strong className="text-white font-semibold">Minga Guazú</strong>! Otras localidades bajo consulta de envío.
              </>
            )}
          </p>
        </div>

        {/* Newsletter & Sub */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
            {locale === "pt" ? "Receba Lançamentos" : "Recibe Novedades"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {locale === "pt"
              ? "Assine nossa newsletter para receber promoções exclusivas e novidades em primeira mão."
              : "Suscríbete a nuestro boletín para recibir promociones exclusivas y novedades de primera mano."}
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="seu-email@dominio.com"
              required
              className="flex-1 px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-accent-amber placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-accent-amber hover:bg-amber-600 text-slate-900 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{locale === "pt" ? "Enviar" : "Enviar"}</span>
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-success-green font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> {locale === "pt" ? "Inscrição realizada!" : "¡Suscripción exitosa!"}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-slate-950 py-6 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Muebles.py. Todos os direitos reservados.</p>
          
        </div>
      </div>
      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-slate-900 text-white rounded-full border-2 border-slate-950 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
          title={locale === "pt" ? "Voltar ao Topo" : "Volver al Inicio"}
        >
          <ArrowUp className="w-5 h-5 text-accent-amber group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </footer>
  );
};
export default Footer;
