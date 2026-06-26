import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ma Wishlist",
  description: "Retrouvez vos pièces favorites iDoh ELITE sauvegardées. Ne les laissez pas partir.",
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
