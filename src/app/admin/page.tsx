"use client";

import React, { useState, useEffect } from "react";
import { useDB } from "@/context/DBContext";
import { TrendingUp, ShoppingBag, AlertTriangle, Eye, DollarSign, ArrowUpRight, UserCheck } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { products, orders } = useDB();
  const [leadsCount, setLeadsCount] = useState(0);

  // Load leads from localStorage
  useEffect(() => {
    const savedLeads = localStorage.getItem("muebles_leads");
    if (savedLeads) {
      try {
        setLeadsCount(JSON.parse(savedLeads).length);
      } catch (err) {}
    } else {
      setLeadsCount(2); // fallback seed count
    }
  }, []);

  // Metrics Calculations
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const todayOrdersCount = todayOrders.length;
  
  // Total Revenue
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelado")
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Low Stock Items
  const lowStockProducts = products.filter((p) => p.stock <= p.min_stock);
  const lowStockCount = lowStockProducts.length;

  // Total Views
  const totalViews = products.reduce((sum, p) => sum + p.views_count, 0);

  // Conversion rate (orders / views)
  const conversionRate = totalViews > 0 ? ((orders.length / totalViews) * 100).toFixed(1) : "0.0";

  // Top Viewed products
  const topViewed = [...products]
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 5);

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase";
      case "Confirmado":
        return "bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase";
      case "Separando":
        return "bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase";
      case "Em Transporte":
        return "bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase";
      case "Entregue":
        return "bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase";
      case "Cancelado":
        return "bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase";
      default:
        return "bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header (Clean Modern) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Painel Executivo</h1>
          <p className="text-xs text-slate-500 font-bold">Métricas gerais de vendas, leads e conversão da sua loja</p>
        </div>
        <div className="text-xs text-slate-500 bg-white border border-slate-200/60 px-4 py-2.5 rounded-xl font-bold shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          Atualizado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Daily Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Pedidos de Hoje</span>
            <h3 className="text-2xl font-black text-slate-950">{todayOrdersCount}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Receita Total</span>
            <h3 className="text-lg font-black text-slate-950 truncate max-w-[130px]">{formatCurrency(totalRevenue)}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Captured Leads */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Leads de Desconto</span>
            <h3 className="text-2xl font-black text-slate-950">{leadsCount}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Taxa Conversão</span>
            <h3 className="text-2xl font-black text-slate-950">{conversionRate}%</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className={`rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all ${lowStockCount > 0 ? "bg-red-50/50" : "bg-white"}`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Aviso de Estoque</span>
            <h3 className={`text-2xl font-black ${lowStockCount > 0 ? "text-red-700" : "text-slate-950"}`}>
              {lowStockCount} itens
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? "bg-red-100 text-red-650" : "bg-slate-50 text-slate-400"}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Row 2: Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders log */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wide">Pedidos Recentes</h2>
              <Link href="/admin/orders" className="text-xs text-slate-650 hover:text-amber-600 font-bold flex items-center gap-1">
                <span>Ver Todos</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-450 font-bold uppercase tracking-wider border-b border-slate-150 text-[10px]">
                    <th className="px-6 py-3.5">Número</th>
                    <th className="px-6 py-3.5">Cliente</th>
                    <th className="px-6 py-3.5">Cidade</th>
                    <th className="px-6 py-3.5">Valor</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">#{o.order_number}</td>
                      <td className="px-6 py-4 font-bold text-slate-950">{o.customer_name}</td>
                      <td className="px-6 py-4">{o.city}</td>
                      <td className="px-6 py-4 font-bold text-slate-950">{formatCurrency(o.total_amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block ${getStatusBadge(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">Nenhum pedido cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Products Views */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-450" />
              <span>Mais Procurados</span>
            </h2>

            <div className="space-y-4 divide-y divide-slate-100">
              {topViewed.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between gap-3 text-xs font-bold pt-3 first:pt-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{prod.name_pt}</h4>
                    <p className="text-[10px] text-slate-400 truncate">Estoque: {prod.stock} un</p>
                  </div>
                  <span className="font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px]">
                    <Eye className="w-3 h-3 text-slate-400" /> {prod.views_count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockCount > 0 && (
            <div className="bg-red-50/30 border border-red-100 text-red-950 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-3">
              <h2 className="text-xs font-black text-red-800 uppercase flex items-center gap-1.5 border-b border-red-100/50 pb-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Alerta de Reposição</span>
              </h2>
              <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs font-bold text-slate-850 pt-1.5 first:pt-0">
                    <span className="truncate flex-1 pr-2">{p.name_pt}</span>
                    <span className="text-red-600 font-extrabold whitespace-nowrap bg-red-100 px-2.5 py-0.5 rounded-full text-[10px]">{p.stock} un</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
