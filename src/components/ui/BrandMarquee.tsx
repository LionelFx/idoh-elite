"use client";

// Vrais logos SVG — source : Simple Icons (CC0)
const NikeIcon = () => (
  <svg viewBox="0 0 24 24" aria-label="Nike" className="h-5 w-auto fill-white/50 group-hover:fill-white/80 transition-colors duration-300">
    <path d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z" />
  </svg>
);

const AdidasIcon = () => (
  <svg viewBox="0 0 24 24" aria-label="Adidas" className="h-6 w-auto fill-white/50 group-hover:fill-white/80 transition-colors duration-300">
    <path d="m24 19.535-8.697-15.07-4.659 2.687 7.145 12.383Zm-8.287 0L9.969 9.59 5.31 12.277l4.192 7.258ZM4.658 14.723l2.776 4.812H1.223L0 17.41Z" />
  </svg>
);

const NewBalanceIcon = () => (
  <svg viewBox="0 0 24 21" aria-label="New Balance" className="h-5 w-auto fill-white/50 group-hover:fill-white/80 transition-colors duration-300">
    <path d="M12.169 10.306l1.111-1.937 3.774-.242.132-.236-3.488-.242.82-1.414h6.47c1.99 0 3.46.715 2.887 2.8-.17.638-.979 2.233-3.356 2.899.507.06 1.76.616 1.54 2.057-.384 2.558-3.69 3.774-5.533 3.774l-7.641.006-.38-1.48 4.005-.28.137-.237-4.346-.264-.467-1.755 6.178-.363.137-.231-11.096-.693.534-.925 11.948-.775.138-.231-3.504-.231m5 .385l1.1-.006c.738-.005 1.502-.34 1.783-1.018.259-.632-.088-1.171-.55-1.166h-1.067l-1.266 2.19zm-1.27 2.195l-1.326 2.305h1.265c.589 0 1.64-.292 1.964-1.128.302-.781-.253-1.177-.638-1.177h-1.266zM6.26 16.445l-.77 1.315L0 17.77l.534-.923 5.726-.402zm.385-10.216l4.417.006.336 1.248-5.276-.33.523-.924zm5 2.245l.484 1.832-7.542-.495.528-.92 6.53-.417zm-3.84 5.281l-.957 1.661-5.32-.302.534-.924 5.743-.435z" />
  </svg>
);

// Jumpman silhouette simplifié (Jordan Brand)
const JordanIcon = () => (
  <svg viewBox="0 0 24 24" aria-label="Jordan" className="h-7 w-auto fill-white/50 group-hover:fill-white/80 transition-colors duration-300">
    <path d="M13.55 2.194v-.075c0-.35.113-.663.338-.938.225-.275.512-.412.862-.412s.663.112.938.337.425.525.45.9c.025.375-.088.688-.338.938s-.55.375-.9.375l-.225.075.075.112-.075.413-.15 1.2c.05.05.075.1.075.15l-.15.75c-.05.1-.1.175-.15.225l-.075.3a22.59 22.59 0 01-.45 1.575v.15c-.05.25-.087.45-.112.6-.025.15-.113.4-.263.75-.1.2-.1.525 0 .975l.075.075c0 .15.063.325.188.525s.187.375.187.525c.05 1-.025 1.85-.225 2.55l.15.45c.6.3.775.625.525.975l.375.15c.6.3 1.025.562 1.275.787.25.225.5.463.75.713.2.05.35.125.45.225l.225.075c1.05.7 2.1 1.55 3.15 2.55l.3.225v.075l-.075.15.225.15h.075c.15.1.25.15.3.15h.075c.05 0 .1-.025.15-.075l.15-.075c.1-.1.2-.175.3-.225h.3c.05 0 .05.025 0 .075l-.3.15-.375.45h.525l.525.075c.15-.05.275-.1.375-.15l.375-.225c.15-.05.3 0 .45.15h.075c.05.05.025.125-.075.225l-.9.825c-.25.2-.475.325-.675.375l-.975.675c-.05.05-.1.05-.15 0l-.225-.3-.15-.3-.188-.263-.225-.3-.187-.225-.15-.187-.3-.225c-.1 0-.2-.025-.3-.075l-.975-.75c-.15 0-.325-.075-.525-.225-.75-.65-1.25-1.05-1.5-1.2l-.45-.3-.9-.15c-.3-.05-.7-.2-1.2-.45l-.6-.3c-.4-.2-.675-.3-.825-.3l-.3-.15c-.2-.05-.35-.1-.45-.15l-.15-.15c-.1 0-.2.025-.3.075l-1.5.75-1.875.825c-.5.4-.975.725-1.425.975l-.825.375-1.275.9c-.1.1-.2.1-.3 0l-.15.15c-.15.05-.25.075-.3.075l-.3.15v.15H3.2l-.15.225c-.1.2-.2.312-.3.337-.1.025-.162.063-.187.113a.434.434 0 01-.075.112l-.15.15-.225.15-.338-.037-.45.075-.3.075c-.25.05-.45.012-.6-.113-.15-.125-.275-.312-.375-.562-.1-.15-.05-.275.15-.375l.075-.075c.05-.05.125-.075.225-.075h.45l.6-.225.3-.075c0-.1.025-.175.075-.225.05-.05.125-.075.225-.075v-.075a.666.666 0 01-.075-.3c-.05-.1-.063-.175-.037-.225.025-.05.05-.075.075-.075h.037l.075.225c.05.25.125.325.225.225l.075-.15c.05-.1.125-.15.225-.15l.15.15.15-.15-.075-.075c0-.05.025-.075.075-.075l.3-.3c.25-.3.55-.575.9-.825.7-.55 1.45-.975 2.25-1.275.25-.25.525-.375.825-.375.2-.35.5-.725.9-1.125.35-.25.6-.425.75-.525.1-.2.225-.3.375-.3h.075l.15-.15c.1-.05.175-.1.225-.15v-.375c0-.25.025-.45.075-.6.05-.15.175-.225.375-.225l.3-.3c-.1-.2-.15-.425-.15-.675h-.075c-.1-.15-.15-.3-.15-.45-.15-.25-.25-.45-.3-.6H9.65c-.05.15-.175.25-.375.3l-.075.15c-.2.35-.375.612-.525.787-.15.175-.425.388-.825.638-.25.25-.425.525-.525.825-.05.15-.05.3 0 .45l-.075.15h.075c0 .1.025.15.075.15h.075c.1.05.15.112.15.187s-.075.1-.225.075a.606.606 0 01-.337-.15c-.075-.075-.138-.112-.188-.112l-.225.225c-.1.15-.2.212-.3.187-.1-.025-.125-.062-.075-.112l.075-.075c.05-.1.05-.15 0-.15l-.6.15c-.05.05-.112.05-.187 0s-.063-.1.037-.15l.375-.15c0-.05-.025-.075-.075-.075-.2.1-.4.125-.6.075l-.375-.075-.075-.075c0-.05.025-.075.075-.075.2.05.45.025.75-.075l.525-.225.6-.675.075-.15c.2-.4.413-.763.638-1.088a3.68 3.68 0 01.712-.787l.075-.3c.1-.2.2-.375.3-.525.1-.15.225-.35.375-.6l.225-.3c.2-.3.425-.45.675-.45l.225-.225c.05-.05.075-.125.075-.225l.15-.15-.075-.075c-.3-.25-.45-.475-.45-.675-.05-.35.063-.65.338-.9s.55-.363.825-.338c.275.025.487.113.637.263l.15.15c.05 0 .075.025.075.075l.3.15v.225c.1.1.15.175.15.225.1-.15.25-.325.45-.525l.375-1.2c0-.2.05-.4.15-.6l.15-.225v-.15l.225-.9h.15l.225-.9a.933.933 0 000-.525l-.3-.75-.15-.6z" />
  </svg>
);

// Logos texte stylisés pour les marques sans SVG simple
const SupremeBox = () => (
  <div className="border border-white/30 px-2.5 py-0.5 group-hover:border-white/60 transition-colors duration-300">
    <span className="font-condensed font-black uppercase text-white/50 group-hover:text-white/80 transition-colors duration-300 text-xs tracking-[0.15em]">
      Supreme
    </span>
  </div>
);

const TextLogo = ({ children, spacing = "tracking-[0.25em]" }: { children: React.ReactNode; spacing?: string }) => (
  <span className={`font-condensed font-black uppercase text-white/50 group-hover:text-white/80 transition-colors duration-300 text-sm ${spacing}`}>
    {children}
  </span>
);

const brandItems = [
  { id: "nike",       el: <NikeIcon /> },
  { id: "lv",         el: <TextLogo spacing="tracking-[0.3em]">LOUIS VUITTON</TextLogo> },
  { id: "jordan",     el: <JordanIcon /> },
  { id: "burberry",   el: <TextLogo spacing="tracking-[0.3em]">Burberry</TextLogo> },
  { id: "adidas",     el: <AdidasIcon /> },
  { id: "supreme",    el: <SupremeBox /> },
  { id: "nb",         el: <NewBalanceIcon /> },
  { id: "offwhite",   el: <TextLogo>OFF—WHITE™</TextLogo> },
  { id: "stone",      el: <TextLogo spacing="tracking-[0.2em]">Stone Island</TextLogo> },
  { id: "palace",     el: <TextLogo spacing="tracking-[0.2em]">PALACE</TextLogo> },
  { id: "fog",        el: <TextLogo spacing="tracking-[0.1em]">Fear of God</TextLogo> },
  { id: "stussy",     el: <TextLogo spacing="tracking-widest italic">Stüssy</TextLogo> },
];

// Duplicate for seamless loop
const all = [...brandItems, ...brandItems];

export default function BrandMarquee() {
  return (
    <section className="bg-[#111111] py-5 overflow-hidden border-y border-white/5">
      <div className="flex overflow-hidden select-none">
        <div className="flex items-center animate-marquee">
          {all.map((brand, i) => (
            <div key={i} className="group flex items-center flex-shrink-0">
              <div className="px-8">{brand.el}</div>
              <span className="text-[#FF9D3D]/60 text-lg">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
