"use client";

import React, { useState } from "react";
import { useDB, Order } from "@/context/DBContext";
import { useTranslation } from "@/context/LanguageContext";
import { Smartphone, Mail, MapPin, ClipboardCheck, MessageSquare, Search } from "lucide-react";

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useDB();
  const { locale } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-50 text-blue-600";
      case "Confirmado":
        return "bg-emerald-50 text-emerald-600";
      case "Separando":
        return "bg-amber-50 text-amber-600";
      case "Em Transporte":
        return "bg-purple-50 text-purple-600";
      case "Entregue":
        return "bg-slate-100 text-slate-600";
      case "Cancelado":
        return "bg-red-50 text-red-600";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  // Filter orders by name, city, phone or order number
  const filteredOrders = orders.filter((o) => {
    const term = searchQuery.toLowerCase();
    return (
      o.customer_name.toLowerCase().includes(term) ||
      o.city.toLowerCase().includes(term) ||
      o.customer_phone.includes(term) ||
      String(o.order_number).includes(term)
    );
  });

  const handleWhatsAppContact = (order: Order) => {
    const text = encodeURIComponent(
      locale === "pt"
        ? `Olá ${order.customer_name}! Sou do atendimento do Muebles.py. Seu pedido #${order.order_number} encontra-se com o status: *${order.status}*.`
        : `¡Hola ${order.customer_name}! Soy del servicio al cliente de Muebles.py. Tu pedido #${order.order_number} se encuentra con el estado: *${order.status}*.`
    );
    window.open(`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gerenciamento de Pedidos</h1>
        <p className="text-xs text-slate-550">Monitore as vendas e atualize o status de entrega dos clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Orders Log List (Left Column) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por cliente, cidade, telefone ou número..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-white shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Orders log table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                    <th className="px-5 py-3">Número</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Valor</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => {
                        setSelectedOrder(o);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          setTimeout(() => {
                            document.getElementById("order-details-card")?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }
                      }}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedOrder?.id === o.id ? "bg-amber-50/30 text-slate-950 font-bold" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono text-slate-400">#{o.order_number}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800">{o.customer_name}</div>
                        <div className="text-[10px] text-slate-450">{o.city}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-900 font-bold">{formatCurrency(o.total_amount)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadge(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400">Nenhum pedido encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Detailed Order Panel (Right Column) */}
        <div id="order-details-card" className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6 min-h-[400px]">
          {selectedOrder ? (
            <div className="space-y-6">
              
              {/* Order code and status change dropdown */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Pedido #{selectedOrder.order_number}</h2>
                  <p className="text-[10px] text-slate-400">{new Date(selectedOrder.created_at).toLocaleString("pt-BR")}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 text-right">Status do Pedido</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Order["status"];
                      updateOrderStatus(selectedOrder.id, newStatus);
                      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
                    }}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-amber-500 font-semibold transition-all cursor-pointer"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Separando">Separando</option>
                    <option value="Em Transporte">Em Transporte</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Customer Contact & Delivery Info */}
              <div className="space-y-3.5 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Dados do Cliente</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-450" />
                    <span className="font-bold text-slate-800">{selectedOrder.customer_phone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-450" />
                    <span className="text-slate-700">{selectedOrder.customer_email}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-455 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">{selectedOrder.city}</p>
                      <p className="text-slate-500">{selectedOrder.address}</p>
                    </div>
                  </li>
                </ul>

                {selectedOrder.notes && (
                  <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 text-slate-600 leading-relaxed mt-2">
                    <strong className="text-slate-700 block mb-1">Notas Internas / Observação:</strong>
                    {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Purchased Items List */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-450">Itens Adquiridos</h3>
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 line-clamp-1">{locale === "pt" ? item.name_pt : item.name_es}</h4>
                        <p className="text-slate-400 font-mono text-[10px]">{item.qty}x {formatCurrency(item.price)}</p>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-3">
                    <span>Valor Total</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Action Contact Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleWhatsAppContact(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm cursor-pointer border-0"
                >
                  <MessageSquare className="w-4 h-4 fill-white text-white border-none" />
                  <span>Notificar Status no WhatsApp</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <ClipboardCheck className="w-12 h-12 text-slate-350" />
              <div>
                <p className="font-bold text-slate-500">Detalhes do Pedido</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">Selecione um pedido na lista para visualizar dados de entrega, alterar status ou contatar o cliente.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
