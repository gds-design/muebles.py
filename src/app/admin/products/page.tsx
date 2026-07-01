"use client";

import React, { useState } from "react";
import { useDB, Product } from "@/context/DBContext";
import { Plus, Edit3, Copy, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminProducts() {
  const { products, categories, duplicateProduct, deleteProduct } = useDB();
  const router = useRouter();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  return (
    <div className="space-y-6 font-sans text-slate-950">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gerenciamento de Produtos</h1>
          <p className="text-xs text-slate-500">Crie, edite ou duplique itens do catálogo e configure promoções</p>
        </div>
        <button
          onClick={() => router.push("/admin/products/new")}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold border-0 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Listing View */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-55/50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Marca / SKU</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-center">Selos</th>
                <th className="px-6 py-4 text-center">Estoque</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
              {products.map((p) => {
                const categoryName = categories.find((c) => c.id === p.category_id)?.name_pt || "Nenhum";
                const isLowStock = p.stock <= p.min_stock;

                return (
                  <tr
                    key={p.id}
                    onClick={() => router.push("/admin/products/edit/" + p.id)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg border border-slate-150 p-1 flex items-center justify-center flex-shrink-0">
                        {p.images && p.images.length > 0 && (
                          <img src={p.images[0]} alt={p.name_pt} className="max-h-full max-w-full object-contain" loading="lazy" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate max-w-xs group-hover:text-amber-600 transition-colors">{p.name_pt}</h4>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.name_es}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold">{p.brand || "—"}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.sku || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{categoryName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col font-mono font-bold text-slate-800">
                        <span>{formatCurrency(p.promo_price || p.price)}</span>
                        {p.promo_price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(p.price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                        {p.badges?.includes("promo") && <span className="bg-red-50 text-red-650 px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold">Oferta</span>}
                        {p.badges?.includes("featured") && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold">Destaque</span>}
                        {p.badges?.includes("bestseller") && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold">Mais Vendido</span>}
                        {p.badges?.includes("free_shipping") && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold">Frete Grátis</span>}
                        {p.badges?.includes("new") && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold">Novo</span>}
                        {p.badges?.includes("last_units") && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold">Últimas Unidades</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-mono">
                        <span className={`font-bold ${isLowStock ? "text-red-500" : "text-slate-850"}`}>
                          {p.stock}
                        </span>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-400 text-[10px]">{p.min_stock}</span>
                        {isLowStock && (
                          <span title="Abaixo do estoque mínimo!">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 fill-red-50" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/admin/products/edit/" + p.id);
                          }}
                          className="p-2 text-slate-450 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Produto"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateProduct(p.id);
                          }}
                          className="p-2 text-slate-455 hover:text-amber-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Duplicar Produto"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Confirmar exclusão deste produto?")) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

