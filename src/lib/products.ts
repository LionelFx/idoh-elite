import { getSupabase } from "./supabase";
import type { Product } from "@/types";

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await getSupabase()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Product[];
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data } = await getSupabase()
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  return data as Product | null;
}

// Nombre réel de commandes distinctes contenant ce produit — utilisé pour le compteur
// "X personnes ont déjà acheté cette pièce" sur la fiche produit (pas reviews_count, qui est
// un champ admin manuel sans lien avec les ventes réelles).
export async function fetchPurchaseCount(productId: string): Promise<number> {
  const { data } = await getSupabase()
    .from("order_items")
    .select("order_id")
    .eq("product_id", productId);
  return new Set((data ?? []).map(d => d.order_id)).size;
}

// Sélection homepage : choix manuel admin (is_featured) en priorité, puis
// meilleures ventes réelles (order_items), puis plus récents — toujours filtré sur stock > 0
// pour qu'un produit en rupture ne reste jamais affiché en vedette.
export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  const all = await fetchProducts();
  const inStock = all.filter(p => p.stock > 0);

  const curated = inStock.filter(p => p.is_featured);
  if (curated.length >= limit) return curated.slice(0, limit);

  const { data: items } = await getSupabase()
    .from("order_items")
    .select("product_id, quantity");

  const soldCount: Record<string, number> = {};
  (items ?? []).forEach(item => {
    soldCount[item.product_id] = (soldCount[item.product_id] ?? 0) + item.quantity;
  });

  const remaining = inStock.filter(p => !p.is_featured);
  const bestSellers = remaining
    .filter(p => soldCount[p.id] > 0)
    .sort((a, b) => soldCount[b.id] - soldCount[a.id]);

  const combined = [...curated, ...bestSellers];
  if (combined.length >= limit) return combined.slice(0, limit);

  const recentFill = remaining.filter(p => !soldCount[p.id]);
  return [...combined, ...recentFill].slice(0, limit);
}
