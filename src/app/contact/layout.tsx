import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question ? Un problème de commande ? L'équipe iDoh ELITE vous répond sous 24h.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
