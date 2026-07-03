"use client";

import React from "react";
import ProductForm from "@/components/ProductForm";
import { useDB } from "@/context/DBContext";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AdminProductsEdit() {
  const params = useParams();
  const router = useRouter();
  const { products } = useDB();

  const productId = params?.id as string;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="space-y-6 font-sans bg-white p-6 text-slate-950 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-black">Produto não encontrado</h2>
        <p className="text-slate-500">O produto que você tentou editar não existe ou foi excluído.</p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white rounded-lg font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans bg-white p-2 text-slate-950">
      <ProductForm isEditing={true} initialData={product} />
    </div>
  );
}
