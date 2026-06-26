"use client";

import { getColorName } from "@/lib/colors";

interface ColorPickerProps {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
  outOfStock?: string[];
}

export default function ColorPicker({ colors, selected, onChange, outOfStock = [] }: ColorPickerProps) {
  if (colors.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#999999]">Couleur</span>
        <span className="text-xs font-semibold text-[#1a1a1a]">{getColorName(selected)}</span>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        {colors.map((color) => {
          const oos = outOfStock.includes(color);
          return (
            <div key={color} className="relative">
              <button
                onClick={() => !oos && onChange(color)}
                disabled={oos}
                title={oos ? "Rupture de stock" : getColorName(color)}
                className={`w-8 h-8 rounded-full transition-all duration-150 flex-shrink-0 ${
                  oos
                    ? "opacity-35 cursor-not-allowed"
                    : selected === color
                    ? "scale-110 cursor-pointer"
                    : "hover:scale-110 cursor-pointer"
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow: oos
                    ? "none"
                    : selected === color
                    ? "0 0 0 2px #ffffff, 0 0 0 4px #FF9D3D"
                    : "inset 0 0 0 1px rgba(0,0,0,0.15)",
                }}
              />
              {/* Barre de rupture */}
              {oos && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[110%] h-px bg-[#999] rotate-45 opacity-70" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
