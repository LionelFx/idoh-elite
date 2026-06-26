import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getDiscountedPrice } from "@/lib/utils";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idohelite.fr";

  const { data: p } = await supabaseAdmin
    .from("products")
    .select("name, description, images, price, discount_percent, category")
    .eq("id", id)
    .single();

  if (!p) return { title: "Produit introuvable" };

  const price = getDiscountedPrice(p.price, p.discount_percent ?? 0);
  const title = `${p.name} | iDoh ELITE`;
  const description = p.description
    ? `${p.description.slice(0, 150)}…`
    : `${p.name} — Sportswear premium iDoh ELITE. À partir de ${price.toFixed(2)} €.`;
  const image = p.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${id}`,
      type: "website",
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: p.name }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
