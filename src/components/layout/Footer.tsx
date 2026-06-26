import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

// ── Remplace ces 3 URLs quand le client envoie les liens ──
const SOCIAL = {
  instagram: "https://www.instagram.com/idoh_elite?igsh=MWxzM3k5NWN6cTV6bg%3D%3D&utm_source=qr",
  tiktok:    "https://www.tiktok.com/@idoh_elite_luxury",
  snapchat:  "https://www.snapchat.com/@idoh_elite",
};

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
);

// Fantôme Snapchat — forme officielle simplifiée
const SnapchatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C8.8 2 6.3 4.2 6.3 7.8v2.6c-.5.2-1.1.4-1.6.4-.4 0-.7.3-.7.7s.3.7.7.7c.2 0 .6.1 1 .5-.4.8-1 1.8-1.7 2.3 0 0 1.3.7 3.8.9.2.4.5.9.7 1s.3.3.5.3.3-.2.5-.3c.3-.1.5-.6.7-1 2.5-.2 3.8-.9 3.8-.9-.7-.5-1.3-1.5-1.7-2.3.4-.4.8-.5 1-.5.4 0 .7-.3.7-.7s-.3-.7-.7-.7c-.5 0-1.1-.2-1.6-.4V7.8C17.7 4.2 15.2 2 12 2z"/>
  </svg>
);

const socialLinks = [
  { href: SOCIAL.instagram, Icon: InstagramIcon, label: "Instagram", hoverCls: "hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#515BD4] hover:border-transparent hover:text-white" },
  { href: SOCIAL.tiktok,    Icon: TikTokIcon,    label: "TikTok",    hoverCls: "hover:bg-black hover:border-white hover:text-white" },
  { href: SOCIAL.snapchat,  Icon: SnapchatIcon,  label: "Snapchat",  hoverCls: "hover:bg-[#FFFC00] hover:border-[#FFFC00] hover:text-black" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#1a1a1a] text-white">
      <div className="h-1 bg-gradient-to-r from-[#FF9D3D] via-[#FFB366] to-[#FF9D3D]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">

        {/* Brand + socials (côte à côte) */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
          <div>
            <span className="font-condensed font-black uppercase tracking-widest text-2xl block mb-1">
              <span className="text-[#FF9D3D]">iDoh</span>
              <span className="text-white"> ELITE</span>
            </span>
            <p className="text-[#999999] text-sm leading-relaxed max-w-xs mb-4">
              Built for the Elite. Sportswear premium conçu pour ceux qui refusent de s&apos;arrêter.
            </p>
            {/* Icônes réseaux juste sous la description */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ href, Icon, label, hoverCls }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#999999] transition-all duration-200 ${hoverCls}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Liens — 3 colonnes */}
        <div className="grid grid-cols-3 gap-4 lg:gap-8 border-t border-white/10 pt-6">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#FF9D3D] mb-3">Navigation</h4>
            <ul className="space-y-2">
              {[
                { label: "Accueil",      href: "/" },
                { label: "À propos",     href: "/about" },
                { label: "Catalogue",    href: "/products" },
                { label: "Maillots",     href: "/products?cat=maillot" },
                { label: "Chaussures",   href: "/products?cat=chaussure" },
                { label: "Survêtements", href: "/products?cat=survetement" },
                { label: "T-shirts",     href: "/products?cat=tshirt" },
                { label: "Essentiels",   href: "/products?cat=essentiel" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-[#999999] hover:text-[#FF9D3D] transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#FF9D3D] mb-3">Légal</h4>
            <ul className="space-y-2">
              {[
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "CGV", href: "/cgv" },
                { label: "Politique de retours", href: "/politique-retours" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-xs text-[#999999] hover:text-[#FF9D3D] transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#FF9D3D] mb-3">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF9D3D] flex-shrink-0 mt-0.5" />
                <a href="mailto:idohelite@gmail.com" className="text-xs text-[#999999] break-all hover:text-[#FF9D3D] transition-colors">idohelite@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF9D3D] flex-shrink-0 mt-0.5" />
                <a href="tel:+33759887600" className="text-xs text-[#999999] hover:text-[#FF9D3D] transition-colors">+33 7 59 88 76 00</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF9D3D] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#999999]">Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-[#999999]">© 2026 iDoh ELITE. Tous droits réservés.</p>
          <p className="text-[11px] text-[#999999] italic hidden sm:block">&ldquo;Built for the Elite — NE JAMAIS S&apos;ARRÊTER.&rdquo;</p>
        </div>
      </div>
    </footer>
  );
}
