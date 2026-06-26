import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon Panier",
  description: "Finalisez votre commande iDoh ELITE. Livraison rapide, paiement sécurisé.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
