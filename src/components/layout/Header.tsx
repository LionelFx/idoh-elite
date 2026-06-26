"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, Search, Heart, User, LogOut, Package, Settings } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import AnnouncementBar from "./AnnouncementBar";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Catalogue", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { itemCount, mounted } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchValue("");
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchValue.trim())}`);
    setSearchOpen(false);
    setSearchValue("");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] transition-all duration-300 ${
        scrolled ? "shadow-2xl shadow-black/40" : ""
      }`}
    >
      <AnnouncementBar />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-14" : "h-16 lg:h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span
              className={`font-condensed font-black uppercase tracking-widest transition-all duration-300 ${
                scrolled ? "text-xl" : "text-2xl"
              }`}
            >
              <span className="text-[#FF9D3D]">iDoh</span>
              <span className="text-white"> ELITE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-[#FF9D3D]"
                    : "text-white hover:text-[#FF9D3D]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 transition-colors cursor-pointer ${
                searchOpen ? "text-[#FF9D3D]" : "text-white hover:text-[#FF9D3D]"
              }`}
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative text-white hover:text-[#FF9D3D] transition-colors p-2 hidden sm:block"
              aria-label="Favoris"
            >
              <Heart className="w-5 h-5" />
              {mounted && wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF9D3D] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* User */}
            <div className="relative hidden sm:block">
              {user ? (
                <>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 text-[#FF9D3D] hover:text-[#FFB366] transition-colors cursor-pointer">
                    <User className="w-5 h-5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white/40 text-xs">Connecté en tant que</p>
                        <p className="text-white text-sm font-semibold truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link href="/compte" onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> Mon compte
                      </Link>
                      <Link href="/compte/commandes" onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Package className="w-4 h-4" /> Mes commandes
                      </Link>
                      <Link href="/compte/profil" onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/8">
                        <Settings className="w-4 h-4" /> Mon profil
                      </Link>
                      <button onClick={async () => { await signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer">
                        <LogOut className="w-4 h-4" /> Se déconnecter
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/compte"
                  className="p-2 text-white hover:text-[#FF9D3D] transition-colors">
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-white hover:text-[#FF9D3D] transition-colors p-2"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF9D3D] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button
              className="md:hidden text-white hover:text-[#FF9D3D] transition-colors p-2 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            searchOpen ? "max-h-16 pb-3 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Rechercher un produit..."
              autoFocus={searchOpen}
              className="w-full bg-[#2a2a2a] text-white placeholder-[#666] px-4 py-3 rounded outline-none focus:ring-2 focus:ring-[#FF9D3D] text-sm"
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            />
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={`md:hidden bg-[#111111] border-t border-white/10 overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b border-white/5 ${
                pathname === link.href
                  ? "text-[#FF9D3D] bg-white/5"
                  : "text-white hover:text-[#FF9D3D] hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:text-[#FF9D3D] hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Panier
            {mounted && itemCount > 0 && (
              <span className="bg-[#FF9D3D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link href="/compte" onClick={() => setMobileOpen(false)}
                className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:text-[#FF9D3D] hover:bg-white/5 transition-colors flex items-center gap-2">
                <User className="w-4 h-4" /> Mon compte
              </Link>
              <Link href="/compte/commandes" onClick={() => setMobileOpen(false)}
                className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:text-[#FF9D3D] hover:bg-white/5 transition-colors flex items-center gap-2">
                <Package className="w-4 h-4" /> Mes commandes
              </Link>
              <button onClick={async () => { await signOut(); setMobileOpen(false); }}
                className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2 cursor-pointer w-full text-left">
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </>
          ) : (
            <Link href="/compte"
              className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:text-[#FF9D3D] hover:bg-white/5 transition-colors flex items-center gap-2">
              <User className="w-4 h-4" /> Mon compte
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
