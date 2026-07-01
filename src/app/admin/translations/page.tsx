"use client";

import React, { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { Search, Save, CheckCircle, Languages, AlertCircle } from "lucide-react";

export default function AdminTranslations() {
  const { allTranslations, updateTranslation } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  
  // Edit Form state
  const [editPt, setEditPt] = useState("");
  const [editEs, setEditEs] = useState("");

  const [savedAlert, setSavedAlert] = useState(false);

  // Filter keys by search input
  const filteredKeys = Object.keys(allTranslations).filter((key) => {
    const term = searchQuery.toLowerCase();
    const entry = allTranslations[key];
    return (
      key.toLowerCase().includes(term) ||
      entry.pt.toLowerCase().includes(term) ||
      entry.es.toLowerCase().includes(term)
    );
  });

  const handleOpenEdit = (key: string) => {
    setEditingKey(key);
    setEditPt(allTranslations[key].pt);
    setEditEs(allTranslations[key].es);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;

    updateTranslation(editingKey, editPt, editEs);
    setEditingKey(null);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gerenciamento de Idiomas</h1>
        <p className="text-xs text-slate-500">Altere textos da loja de forma dinâmica sem precisar de código (Português & Espanhol)</p>
      </div>

      {savedAlert && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>Tradução atualizada com sucesso! Todas as páginas exibirão o novo texto imediatamente.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Translation Keys List (Left Column) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por chave ou conteúdo do texto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-white shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Translation table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                    <th className="px-5 py-3">Chave (Identificador)</th>
                    <th className="px-5 py-3">Texto Cadastrado</th>
                    <th className="px-5 py-3 text-center">Editar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredKeys.map((key) => {
                    const entry = allTranslations[key];
                    return (
                      <tr
                        key={key}
                        onClick={() => handleOpenEdit(key)}
                        className={`hover:bg-slate-55/30 transition-colors cursor-pointer ${
                          editingKey === key ? "bg-amber-50/30 text-slate-950 font-bold" : ""
                        }`}
                      >
                        <td className="px-5 py-4 font-mono text-[10px] text-slate-450 truncate max-w-56" title={key}>{key}</td>
                        <td className="px-5 py-4 space-y-1">
                          <div className="text-slate-800 font-semibold">🇧🇷 {entry.pt}</div>
                          <div className="text-slate-400 text-[10px]">🇪🇸 {entry.es}</div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(key);
                            }}
                            className="text-amber-650 font-bold hover:underline"
                          >
                            Alterar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Translation Key Editor Form (Right Column) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
          {editingKey ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Editar Conteúdo</h2>
                <p className="text-[10px] font-mono text-slate-400 mt-1 truncate" title={editingKey}>ID: {editingKey}</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Texto em Português (pt-BR)</label>
                  <textarea
                    required
                    value={editPt}
                    onChange={(e) => setEditPt(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 leading-relaxed transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Texto en Español (es)</label>
                  <textarea
                    required
                    value={editEs}
                    onChange={(e) => setEditEs(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 leading-relaxed transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 bg-white rounded-xl font-bold text-xs transition-all shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 text-white rounded-xl font-bold text-xs hover:bg-slate-900 transition-all shadow-sm border-0 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Texto</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-3">
              <Languages className="w-12 h-12 text-slate-300" />
              <div>
                <p className="font-bold text-slate-500">Editor de Idiomas</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-[280px] mx-auto">
                  Selecione um identificador de texto na tabela à esquerda.
                  <br />
                  As alterações refletem na hora em todos os menus, botões, descrições e banners da loja!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
