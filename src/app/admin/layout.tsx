"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, ShoppingCart, Armchair, Megaphone, Languages, Home, Menu, X, User, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check authentication status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("admin_authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "muebles2026") {
      localStorage.setItem("admin_authenticated", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
    setPassword("");
  };

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Análise de Produtos", href: "/admin/analysis", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Pedidos", href: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { label: "Produtos", href: "/admin/products", icon: <Armchair className="w-5 h-5" /> },
    { label: "Leads Capturados", href: "/admin/leads", icon: <User className="w-5 h-5" /> },
    { label: "Central de Marketing", href: "/admin/marketing", icon: <Megaphone className="w-5 h-5" /> },
    { label: "Traduções", href: "/admin/translations", icon: <Languages className="w-5 h-5" /> }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-950">
        <div className="w-full max-w-sm bg-white border-2 border-slate-950 p-6 sm:p-8 rounded-2xl shadow-[5px_5px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="text-center space-y-2">
            <span className="w-12 h-12 bg-slate-950 text-white rounded-xl font-bold flex items-center justify-center text-2xl mx-auto shadow-[3px_3px_0px_rgba(0,0,0,0.25)]">M</span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Painel Administrativo</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase">Senha necessária para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-600">Senha de Acesso</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-3.5 py-2.5 border-2 border-slate-950 rounded-lg text-sm focus:outline-none focus:border-accent-amber font-mono bg-slate-50"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 font-bold border border-red-200 bg-red-50 p-2 rounded-lg text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-accent-amber text-slate-950 hover:bg-amber-400 font-bold text-sm border-2 border-slate-950 rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="text-center border-t border-slate-100 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors"
            >
              <span>Voltar para a Loja</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-0 md:p-4 lg:p-6 flex flex-col font-sans text-slate-950">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-slate-950 text-white px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-white text-slate-900 rounded font-bold flex items-center justify-center">M</span>
          <span className="text-sm font-black tracking-wider uppercase">Muebles Panel</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-slate-900 rounded transition-colors text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto bg-[#f8fafc] rounded-2xl md:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/50 overflow-hidden relative min-h-[85vh]">
        
        {/* Sidebar Navigation */}
        <aside
          className={`w-64 bg-slate-950 text-slate-300 flex-shrink-0 flex flex-col justify-between p-6 lg:sticky lg:top-0 lg:h-auto z-40 fixed inset-y-0 left-0 transform lg:transform-none transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-8">
            {/* Logo area */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 bg-white text-slate-900 rounded-lg font-bold flex items-center justify-center text-lg">M</span>
                <span className="font-black text-white tracking-wider uppercase text-sm">
                  Muebles Panel
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-900 rounded transition-colors text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu List */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-amber-500 text-slate-950"
                        : "hover:bg-slate-900 hover:text-white text-slate-450"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Back Link */}
          <div className="border-t border-slate-800 pt-4 space-y-1.5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Home className="w-4.5 h-4.5" />
              <span>Voltar à Loja</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-950 hover:text-red-350 text-red-400 transition-colors text-left cursor-pointer border-0 bg-transparent"
            >
              <X className="w-4.5 h-4.5" />
              <span>Sair do Painel</span>
            </button>
          </div>
        </aside>

        {/* Sidebar Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-6 sm:p-8 lg:p-10 w-full bg-[#f8fafc]">
          {children}
        </main>

      </div>
    </div>
  );
}
