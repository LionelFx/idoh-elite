import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commander",
  description: "Finalisez votre commande iDoh ELITE en toute sécurité. Livraison Standard ou Express.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
