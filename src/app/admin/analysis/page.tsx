"use client";

import React, { useState, useEffect } from "react";
import { useDB } from "@/context/DBContext";
import {
  TrendingUp,
  ShoppingBag,
  Eye,
  Trash2,
  Smartphone,
  Award,
  Percent,
  Layers,
  ArrowUpRight,
  RefreshCw,
  ShoppingCart
} from "lucide-react";
import Link from "next/link";

interface AbandonedCart {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: {
    product_id: string;
    name_pt: string;
    qty: number;
    price: number;
  }[];
  total_amount: number;
  updated_at: string;
}

export default function AdminAnalysis() {
  const { products, orders, categories } = useDB();
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [activeTab, setActiveTab] = useState<"views" | "sales" | "abandoned" | "conversion">("views");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load and seed abandoned carts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("muebles_abandoned_carts");
    if (saved) {
      try {
        setAbandonedCarts(JSON.parse(saved));
      } catch (err) {}
    } else {
      // Seed initial data for demonstration if empty
      const seeds: AbandonedCart[] = [
        {
          id: "cart-ab-1",
          customer_name: "Guilherme Silva",
          customer_phone: "+595 982 555666",
          customer_email: "guilherme.silva@gmail.com",
          items: [
            { product_id: "prod-1", name_pt: "Cadeira Ergonomica Executive Pro", qty: 1, price: 1590000 }
          ],
          total_amount: 1590000,
          updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        },
        {
          id: "cart-ab-2",
          customer_name: "Gabriela Duarte",
          customer_phone: "+595 973 111222",
          customer_email: "gabi.duarte@hotmail.com",
          items: [
            { product_id: "prod-app-1", name_pt: "Smart TV 55\" QLED Samsung 4K", qty: 1, price: 3990000 },
            { product_id: "prod-app-2", name_pt: "Fritadeira Elétrica Airfryer Philips Walita Digital XL", qty: 1, price: 890000 }
          ],
          total_amount: 4880000,
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: "cart-ab-3",
          customer_name: "Rodrigo Benítez",
          customer_phone: "+595 981 333444",
          customer_email: "rodrigo.benitez@yahoo.com",
          items: [
            { product_id: "prod-5", name_pt: "Escrivaninha Compacta Slim Home Office", qty: 2, price: 790000 }
          ],
          total_amount: 1580000,
          updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
      ];
      setAbandonedCarts(seeds);
      localStorage.setItem("muebles_abandoned_carts", JSON.stringify(seeds));
    }
  }, [refreshTrigger]);

  const handleDeleteCart = (id: string) => {
    if (confirm("Confirmar exclusão deste registro de carrinho abandonado?")) {
      const updated = abandonedCarts.filter((c) => c.id !== id);
      setAbandonedCarts(updated);
      localStorage.setItem("muebles_abandoned_carts", JSON.stringify(updated));
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name_pt : "Sem Categoria";
  };

  // Calculations for Reports
  
  // 1. Top Viewed Products
  const topViewed = [...products]
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 10);

  // 2. Best Sellers
  const salesMap: Record<string, { qty: number; revenue: number; name: string; stock: number }> = {};
  
  // Populate maps from product DB to cover 0 sales
  products.forEach((p) => {
    salesMap[p.id] = { qty: 0, revenue: 0, name: p.name_pt, stock: p.stock };
  });

  // Calculate actual sales
  orders
    .filter((o) => o.status !== "Cancelado")
    .forEach((o) => {
      o.items.forEach((item) => {
        if (salesMap[item.product_id]) {
          salesMap[item.product_id].qty += item.qty;
          salesMap[item.product_id].revenue += item.qty * item.price;
        } else {
          salesMap[item.product_id] = {
            qty: item.qty,
            revenue: item.qty * item.price,
            name: item.name_pt,
            stock: 0
          };
        }
      });
    });

  const bestSellers = Object.entries(salesMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // 3. Category Conversion
  const categoryStats: Record<string, { name: string; views: number; sales: number }> = {};
  
  categories.forEach((cat) => {
    categoryStats[cat.id] = { name: cat.name_pt, views: 0, sales: 0 };
  });

  // Sum views per category
  products.forEach((p) => {
    if (categoryStats[p.category_id]) {
      categoryStats[p.category_id].views += p.views_count;
    }
  });

  // Sum sales per category
  orders
    .filter((o) => o.status !== "Cancelado")
    .forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod && categoryStats[prod.category_id]) {
          categoryStats[prod.category_id].sales += item.qty;
        }
      });
    });

  const categoryConversion = Object.entries(categoryStats)
    .map(([id, data]) => {
      const conversion = data.views > 0 ? (data.sales / data.views) * 100 : 0;
      return { id, ...data, conversion };
    })
    .sort((a, b) => b.conversion - a.conversion);

  // General KPIs
  const totalViews = products.reduce((sum, p) => sum + p.views_count, 0);
  const totalSalesCount = orders.filter((o) => o.status !== "Cancelado").reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
  const overallConversion = totalViews > 0 ? ((totalSalesCount / totalViews) * 100).toFixed(2) : "0.00";
  const mostSoldProduct = bestSellers[0]?.qty > 0 ? bestSellers[0].name : "Nenhum";

  const getWhatsAppRecoveryLink = (cart: AbandonedCart) => {
    const border = "----------------------------------";
    const itemsText = cart.items
      .map((item) => `• ${item.qty}x ${item.name_pt}`)
      .join("\n");

    const message = encodeURIComponent(
      `Olá, *${cart.customer_name}*!\n\n` +
      `Notamos que você selecionou alguns móveis incríveis em nossa loja *Muebles.py*, mas não concluiu o pedido:\n` +
      `${border}\n` +
      `${itemsText}\n` +
      `${border}\n` +
      `Gostaria de tirar alguma dúvida sobre entrega, frete grátis ou formas de pagamento? Estamos prontos para te ajudar com um atendimento personalizado!\n\n` +
      `Responda esta mensagem para podermos fechar seu pedido.`
    );
    return `https://wa.me/${cart.customer_phone.replace(/[^0-9]/g, "")}?text=${message}`;
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} hora(s) atrás`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `${days} dia(s) atrás`;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>📊</span> Análise de Produtos
          </h1>
          <p className="text-xs text-slate-500 font-bold">Relatórios detalhados de engajamento, conversões e carrinhos</p>
        </div>
        <button
          onClick={() => setRefreshTrigger((p) => p + 1)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border border-slate-200 active:translate-y-0.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Views */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Visualizações Totais</span>
            <h3 className="text-2xl font-black text-slate-950">{totalViews}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Most Sold */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1 w-2/3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Produto Mais Vendido</span>
            <h3 className="text-xs font-black text-slate-950 truncate" title={mostSoldProduct}>
              {mostSoldProduct}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Abandoned Carts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Carrinhos Abandonados</span>
            <h3 className="text-2xl font-black text-slate-950">{abandonedCarts.length}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-650 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Overall Conversion */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Conversão Geral</span>
            <h3 className="text-2xl font-black text-slate-950">{overallConversion}%</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Menu Options */}
      <div className="flex flex-wrap gap-2.5 pb-4">
        <button
          onClick={() => setActiveTab("views")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "views"
              ? "bg-amber-500 text-slate-950 border-transparent"
              : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Produtos Mais Vistos</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "sales"
              ? "bg-amber-500 text-slate-950 border-transparent"
              : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Produtos Mais Vendidos</span>
        </button>

        <button
          onClick={() => setActiveTab("abandoned")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "abandoned"
              ? "bg-amber-500 text-slate-950 border-transparent"
              : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Carrinhos Abandonados</span>
        </button>

        <button
          onClick={() => setActiveTab("conversion")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "conversion"
              ? "bg-amber-500 text-slate-950 border-transparent"
              : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categorias com Maior Conversão</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Tab 1: Most Viewed */}
        {activeTab === "views" && (
          <div>
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/40">
              <h2 className="text-xs font-black text-slate-450 uppercase tracking-wide">Produtos com Mais Acessos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-450 font-bold uppercase tracking-wider border-b border-slate-150 text-[10px]">
                    <th className="px-6 py-3.5 text-center w-16">Posição</th>
                    <th className="px-6 py-3.5">Nome do Produto</th>
                    <th className="px-6 py-3.5">Categoria</th>
                    <th className="px-6 py-3.5 text-center">Visualizações</th>
                    <th className="px-6 py-3.5 text-center">Preço</th>
                    <th className="px-6 py-3.5 text-center">Estoque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                  {topViewed.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-mono font-bold text-slate-400">#{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-950">{p.name_pt}</p>
                          <p className="text-[10px] text-slate-400 italic font-medium">{p.name_es}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{getCategoryName(p.category_id)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                          {p.views_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{formatCurrency(p.promo_price || p.price)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock <= p.min_stock ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-655"
                        }`}>
                          {p.stock} un
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Best Sellers */}
        {activeTab === "sales" && (
          <div>
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/40">
              <h2 className="text-xs font-black text-slate-450 uppercase tracking-wide">Produtos com Maior Volume de Vendas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-450 font-bold uppercase tracking-wider border-b border-slate-150 text-[10px]">
                    <th className="px-6 py-3.5 text-center w-16">Posição</th>
                    <th className="px-6 py-3.5">Nome do Produto</th>
                    <th className="px-6 py-3.5 text-center">Unidades Vendidas</th>
                    <th className="px-6 py-3.5 text-center">Faturamento Total</th>
                    <th className="px-6 py-3.5 text-center">Estoque Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                  {bestSellers.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-mono font-bold text-slate-400">#{idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-slate-950">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                          {item.qty} un
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{formatCurrency(item.revenue)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.stock <= 3 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-655"
                        }`}>
                          {item.stock} un
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bestSellers.filter(p => p.qty > 0).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                        Nenhuma venda confirmada registrada no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Abandoned Carts */}
        {activeTab === "abandoned" && (
          <div>
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
              <h2 className="text-xs font-black text-slate-450 uppercase tracking-wide">Logs de Checkout Incompletos</h2>
              <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-black">
                {abandonedCarts.length} carrinhos ativos
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {abandonedCarts.map((cart) => (
                <div key={cart.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row justify-between gap-6 font-bold text-xs text-slate-950">
                  {/* Left Column: Client Details */}
                  <div className="space-y-3 flex-1 text-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-950">{cart.customer_name}</span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">({getTimeAgo(cart.updated_at)})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500">
                      <div>📞 {cart.customer_phone || "Não informado"}</div>
                      <div>✉️ {cart.customer_email || "Não informado"}</div>
                    </div>
                    {/* Items List */}
                    <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-1.5 max-w-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Itens do Carrinho</p>
                      {cart.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-800 font-bold font-mono text-[11px]">
                          <span>{item.qty}x {item.name_pt}</span>
                          <span>{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Totals & Recovery Actions */}
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block font-black">Total Estimado</span>
                      <span className="text-lg font-black text-slate-950">{formatCurrency(cart.total_amount)}</span>
                    </div>

                    <div className="flex gap-2">
                      {cart.customer_phone && (
                        <a
                          href={getWhatsAppRecoveryLink(cart)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-0"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Recuperar WhatsApp</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteCart(cart.id)}
                        className="p-2.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                        title="Remover Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {abandonedCarts.length === 0 && (
                <div className="py-16 text-center text-slate-400 font-bold">
                  Nenhum carrinho abandonado registrado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Category Conversion */}
        {activeTab === "conversion" && (
          <div>
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/40">
              <h2 className="text-xs font-black text-slate-450 uppercase tracking-wide">Conversão por Categoria (Vendas / Visitas)</h2>
            </div>
            <div className="p-6 space-y-6">
              {categoryConversion.map((cat) => {
                const maxPercent = Math.max(...categoryConversion.map((c) => c.conversion));
                const widthPercent = maxPercent > 0 ? (cat.conversion / maxPercent) * 100 : 0;
                
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex justify-between items-end text-xs font-bold text-slate-950">
                      <div>
                        <span className="font-bold text-sm text-slate-800">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({cat.views} visitas • {cat.sales} vendas)</span>
                      </div>
                      <span className="font-mono bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {cat.conversion.toFixed(1)}% conversão
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${Math.max(3, cat.conversion > 0 ? widthPercent : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
