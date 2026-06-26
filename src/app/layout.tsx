import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ToastContainer from "@/components/ui/ToastContainer";
import BackToTop from "@/components/ui/BackToTop";
import PublicLayout from "@/components/layout/PublicLayout";
import CartSyncManager from "@/components/CartSyncManager";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://idohelite.fr"),
  title: {
    default: "iDoh ELITE | Sportswear Premium",
    template: "%s | iDoh ELITE",
  },
  description:
    "iDoh ELITE — Maillots officiels, sneakers de luxe et streetwear premium. Livraison France & UE. Built for the Elite.",
  keywords: ["sportswear", "premium", "maillot", "chaussures", "sport", "élite", "streetwear", "luxe", "performance"],
  authors: [{ name: "iDoh ELITE" }],
  creator: "iDoh ELITE",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "iDoh ELITE",
    title: "iDoh ELITE | Sportswear Premium",
    description: "iDoh ELITE — Maillots officiels, sneakers de luxe et streetwear premium. Livraison France & UE.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iDoh ELITE | Sportswear Premium",
    description: "iDoh ELITE — Maillots officiels, sneakers de luxe et streetwear premium. Livraison France & UE.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${barlow.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col font-sans bg-white text-[#1a1a1a] antialiased">
        <AuthProvider>
          <ToastProvider>
            <WishlistProvider>
              <CartProvider>
                <CartSyncManager />
                <PublicLayout>
                  {children}
                </PublicLayout>
                <ToastContainer />
                <BackToTop />
              </CartProvider>
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
