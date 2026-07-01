"use client";

import React from "react";
import ProductForm from "@/components/ProductForm";

export default function AdminProductsNew() {
  return (
    <div className="space-y-6 font-sans bg-white p-2 text-slate-950">
      <ProductForm isEditing={false} />
    </div>
  );
}
