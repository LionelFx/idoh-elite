"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-condensed font-black uppercase text-white text-3xl">Nouveau produit</h1>
          <p className="text-white/40 text-sm mt-1">Ajouter un produit au catalogue</p>
        </div>
      </div>

      <div className="bg-[#141414] border border-white/8 rounded-2xl p-6 lg:p-8">
        <ProductForm />
      </div>
    </div>
  );
}
