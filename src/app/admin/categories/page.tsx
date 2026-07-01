"use client";

import React, { useState } from "react";
import { useDB, Category } from "@/context/DBContext";
import { 
  Plus, Edit3, Trash2, Tag, Armchair, Gamepad2, Table, 
  Laptop, BookOpen, Tv, Plug, ShoppingCart, Star, Heart, Clock, AlertTriangle 
} from "lucide-react";

export default function AdminCategories() {
  const { categories, addCategory, editCategory, deleteCategory } = useDB();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [namePt, setNamePt] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Armchair");

  // Icon options matching getCategoryIcon in main page
  const iconOptions = [
    { value: "Armchair", label: "🪑 Cadeira (Armchair)" },
    { value: "Gamepad2", label: "🎮 Gamer (Gamepad2)" },
    { value: "Table", label: "🪵 Mesa (Table)" },
    { value: "Laptop", label: "💻 Home Office (Laptop)" },
    { value: "BookOpen", label: "📖 Estante (BookOpen)" },
    { value: "Tv", label: "📺 TV (Tv)" },
    { value: "Plug", label: "🔌 Eletrodomésticos (Plug)" },
    { value: "ShoppingCart", label: "🛒 Carrinho (ShoppingCart)" },
    { value: "Star", label: "⭐ Estrela (Star)" },
    { value: "Heart", label: "❤️ Coração (Heart)" },
    { value: "Clock", label: "⏰ Relógio (Clock)" }
  ];

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Armchair": return <Armchair className="w-4 h-4" />;
      case "Gamepad2": return <Gamepad2 className="w-4 h-4" />;
      case "Table": return <Table className="w-4 h-4" />;
      case "Laptop": return <Laptop className="w-4 h-4" />;
      case "BookOpen": return <BookOpen className="w-4 h-4" />;
      case "Tv": return <Tv className="w-4 h-4" />;
      case "Plug": return <Plug className="w-4 h-4" />;
      case "ShoppingCart": return <ShoppingCart className="w-4 h-4" />;
      case "Star": return <Star className="w-4 h-4" />;
      case "Heart": return <Heart className="w-4 h-4" />;
      case "Clock": return <Clock className="w-4 h-4" />;
      default: return <Armchair className="w-4 h-4" />;
    }
  };

  const handleGenerateSlug = (value: string) => {
    const computed = value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(computed);
  };

  const resetForm = () => {
    setNamePt("");
    setNameEs("");
    setSlug("");
    setIcon("Armchair");
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditClick = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setNamePt(cat.name_pt);
    setNameEs(cat.name_es);
    setSlug(cat.slug);
    setIcon(cat.icon);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namePt.trim() || !nameEs.trim()) {
      alert("Por favor preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      name_pt: namePt.trim(),
      name_es: nameEs.trim(),
      slug: slug.trim() || "categoria-" + Date.now(),
      icon: icon
    };

    if (isEditing && editingId) {
      editCategory(editingId, payload);
    } else {
      addCategory(payload);
    }

    resetForm();
  };

  return (
    <div className="space-y-6 font-sans text-slate-950 animate-fade-in">
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gerenciamento de Categorias</h1>
          <p className="text-xs text-slate-500">Crie, edite ou exclua categorias para classificar os produtos do seu catálogo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Categories List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                  <th className="px-6 py-4">Ícone</th>
                  <th className="px-6 py-4">Nome (PT)</th>
                  <th className="px-6 py-4">Nombre (ES)</th>
                  <th className="px-6 py-4">Slug (URL)</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                {categories.map((cat) => (
                  <tr 
                    key={cat.id} 
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center border border-slate-200">
                        {getCategoryIcon(cat.icon)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{cat.name_pt}</td>
                    <td className="px-6 py-4 text-slate-650">{cat.name_es}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{cat.slug}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-2 text-slate-450 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Categoria"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirmar exclusão da categoria "${cat.name_pt}"?\nProdutos nesta categoria continuarão cadastrados, mas sem a categoria associada.`)) {
                              deleteCategory(cat.id);
                              if (editingId === cat.id) {
                                resetForm();
                              }
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Categoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      Nenhuma categoria cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Add/Edit Form */}
        <div className="lg:col-span-5 bg-white border-2 border-slate-950 rounded-xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-slate-950 pb-3">
            <Tag className="w-5 h-5 text-slate-900" />
            <h2 className="text-sm font-black uppercase text-slate-950">
              {isEditing ? "Editar Categoria" : "Nova Categoria"}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase">Nome (Português) *</label>
              <input
                type="text"
                required
                value={namePt}
                onChange={(e) => {
                  setNamePt(e.target.value);
                  if (!isEditing) handleGenerateSlug(e.target.value);
                }}
                className="w-full px-3 py-2 border-2 border-slate-950 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                placeholder="Ex: Armários de Cozinha"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase">Nombre (Español) *</label>
              <input
                type="text"
                required
                value={nameEs}
                onChange={(e) => setNameEs(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-950 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                placeholder="Ex: Alacenas de Cocina"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase">Link URL (Slug)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-slate-950 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  placeholder="armarios-de-cozinha"
                />
                <button
                  type="button"
                  onClick={() => handleGenerateSlug(namePt)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 border-2 border-slate-950 rounded font-bold cursor-pointer transition-colors"
                >
                  Gerar
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase">Ícone Ilustrativo</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-950 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
              >
                {iconOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {isEditing && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded text-[10px] text-amber-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Alterar o Slug de uma categoria existente pode quebrar links caso a categoria esteja indexada ou salva em favoritos.</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-accent-amber hover:bg-amber-400 text-slate-950 font-bold border-2 border-slate-950 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center"
              >
                {isEditing ? "Salvar Alterações" : "Cadastrar Categoria"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-2 border-slate-950 rounded transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
