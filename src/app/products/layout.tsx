import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue — Maillots, Sneakers & Streetwear",
  description: "Découvrez la collection iDoh ELITE : maillots officiels, sneakers de luxe, streetwear premium. Jordan, LV, Nike, Burberry — les meilleures pièces du game.",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
