import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idohelite.fr";

  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, created_at");

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${siteUrl}/products/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: siteUrl,                   lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
    { url: `${siteUrl}/products`,     lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
    ...productUrls,
  ];
}
