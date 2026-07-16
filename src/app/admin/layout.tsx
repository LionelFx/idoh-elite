"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, Tag, Mail, MessageSquare, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { href: "/admin",              icon: LayoutDashboard, label: "Dashboard"  },
  { href: "/admin/orders",       icon: ShoppingBag,     label: "Commandes"  },
  { href: "/admin/products",     icon: Package,         label: "Produits"   },
  { href: "/admin/promo-codes",  icon: Tag,             label: "Promos"     },
  { href: "/admin/newsletter",   icon: Mail,            label: "Newsletter" },
  { href: "/admin/messages",     icon: MessageSquare,   label: "Messages"   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  if (!ready) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? "flex" : "hidden lg:flex"} flex-col w-64 bg-[#0a0a0a] border-r border-white/8 min-h-screen`}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8">
        <Link href="/admin" className="block">
          <span className="font-condensed font-black uppercase tracking-widest text-xl">
            <span className="text-[#FF9D3D]">iDoh</span>
            <span className="text-white"> ELITE</span>
          </span>
          <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Admin</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? "bg-[#FF9D3D]/15 text-[#FF9D3D] border border-[#FF9D3D]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/8">
        <Link href="/" target="_blank"
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-bold border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all mb-2">
          <span>↗</span> Voir le site
        </Link>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all w-full cursor-pointer">
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#111111]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/8">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-condensed font-black uppercase text-white text-lg">
            <span className="text-[#FF9D3D]">iDoh</span> ELITE Admin
          </span>
          <div className="w-5" />
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
