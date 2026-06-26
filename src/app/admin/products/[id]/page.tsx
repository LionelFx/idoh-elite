"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase().from("products").select("*").eq("id", id).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 text-white/40">Produit introuvable.</div>
  );

  const str = (v: unknown, fallback = "") => (v != null ? String(v) : fallback);
  const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
  const obj = (v: unknown): Record<string, number> =>
    (v && typeof v === "object" && !Array.isArray(v)) ? (v as Record<string, number>) : {};
  const obj2 = (v: unknown): Record<string, Record<string, number>> =>
    (v && typeof v === "object" && !Array.isArray(v)) ? (v as Record<string, Record<string, number>>) : {};

  const initial = {
    id: str(product.id),
    name: str(product.name),
    price: str(product.price),
    discount_percent: str(product.discount_percent, "0"),
    description: str(product.description),
    category: str(product.category, "Maillot"),
    category_id: str(product.category_id, "1"),
    brand: str(product.brand),
    rating: str(product.rating, "4.5"),
    reviews_count: str(product.reviews_count, "0"),
    stock_by_size: obj(product.stock_by_size),
    stock_by_color: obj(product.stock_by_color),
    stock_by_variant: obj2(product.stock_by_variant),
    colors: arr(product.colors),
    images: arr(product.images),
    color_images: (product.color_images && typeof product.color_images === "object" && !Array.isArray(product.color_images)
      ? product.color_images : {}) as Record<string, string>,
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-condensed font-black uppercase text-white text-3xl">Modifier le produit</h1>
          <p className="text-white/40 text-sm mt-1 truncate max-w-xs">{product.name as string}</p>
        </div>
      </div>

      <div className="bg-[#141414] border border-white/8 rounded-2xl p-6 lg:p-8">
        <ProductForm initial={initial} />
      </div>
    </div>
  );
}
