"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  overrideImage?: string;
}

export default function ProductGallery({ images, productName, overrideImage }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Autoplay — défile en boucle, pause au survol. Coupé tant qu'une photo de couleur
  // est forcée : cette photo ne doit apparaître que sur clic, jamais toute seule.
  useEffect(() => {
    if (images.length <= 1 || hovered || overrideImage) return;
    const id = setInterval(() => {
      setSelected(s => (s === images.length - 1 ? 0 : s + 1));
    }, 3500);
    return () => clearInterval(id);
  }, [images.length, hovered, overrideImage]);

  const prev = () => setSelected(s => (s === 0 ? images.length - 1 : s - 1));
  const next = () => setSelected(s => (s === images.length - 1 ? 0 : s + 1));

  const mainSrc = overrideImage ?? images[selected];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative aspect-square bg-[#f5f5f5] rounded-xl overflow-hidden group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={mainSrc}
          alt={overrideImage ? `${productName} — couleur sélectionnée` : `${productName} — vue ${selected + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Navigation/miniatures désactivées tant qu'une photo de couleur est forcée —
            elle ne doit être quittable qu'en changeant de couleur, pas en naviguant. */}
        {!overrideImage && images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-[#1a1a1a]" />
            </button>
          </>
        )}

        {/* Indicateurs + autoplay bar */}
        {!overrideImage && images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === selected ? "bg-[#FF9D3D] w-5" : "bg-white/60 w-1.5 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {!overrideImage && images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer flex-shrink-0 ${
                i === selected ? "border-[#FF9D3D] shadow-md" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
