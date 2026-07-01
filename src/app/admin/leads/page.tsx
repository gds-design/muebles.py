"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, ClipboardCheck, Trash2, Smartphone, Mail, Calendar, User } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load captured leads from localStorage
    const savedLeads = localStorage.getItem("muebles_leads");
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (err) {}
    } else {
      // Seed fallback leads for previewing
      const seeds: Lead[] = [
        { id: "lead-1", name: "Guillermo Ortiz", email: "guillermo.ortiz@outlook.com", phone: "+595 983 234567", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "lead-2", name: "Estela Benítez", email: "estela@tigo.com.py", phone: "+595 972 654321", created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      setLeads(seeds);
      localStorage.setItem("muebles_leads", JSON.stringify(seeds));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Confirmar exclusão deste contato?")) {
      const updated = leads.filter((l) => l.id !== id);
      setLeads(updated);
      localStorage.setItem("muebles_leads", JSON.stringify(updated));
    }
  };

  // CSV Export helper
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = "Nome,E-mail,Telefone,Data Cadastro\n";
    const rows = leads
      .map((l) => `"${l.name}","${l.email}","${l.phone}","${new Date(l.created_at).toLocaleDateString("pt-BR")}"`)
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads-muebles-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const term = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term) ||
      l.phone.includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Captação de Leads</h1>
          <p className="text-xs text-slate-500">Contatos capturados no pop-up de cupom de desconto</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold border-0 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-5 flex items-center justify-between border border-slate-800/20 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Leads Capturados</span>
          <h3 className="text-3xl font-black">{leads.length} contatos</h3>
        </div>
        <div className="w-12 h-12 bg-white/10 text-amber-500 rounded-xl flex items-center justify-center border border-white/10">
          <ClipboardCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Main filterable list */}
      <div className="space-y-4">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar leads por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-white text-slate-950 font-bold placeholder:text-slate-400 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Table layout */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">WhatsApp / Telefone</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Data Cadastro</th>
                  <th className="px-6 py-4 text-center">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-450 flex-shrink-0" />
                      <span className="text-slate-900 font-bold">{l.name}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <a
                        href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-amber-600 transition-colors text-slate-700 font-bold"
                      >
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <span>{l.phone}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{l.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(l.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="p-2 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Contato"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">Nenhum contato cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
