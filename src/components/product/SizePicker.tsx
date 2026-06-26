"use client";

interface SizePickerProps {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
  outOfStock?: string[];
}

export default function SizePicker({ sizes, selected, onChange, outOfStock = [] }: SizePickerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#999999]">Taille</span>
        {selected && <span className="text-xs font-semibold text-[#1a1a1a]">Sélectionné : {selected}</span>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {sizes.map((size) => {
          const isOos = outOfStock.includes(size);
          const isSelected = selected === size;
          return (
            <button
              key={size}
              onClick={() => !isOos && onChange(size)}
              disabled={isOos}
              className={`min-w-[48px] h-11 px-3 text-sm font-bold rounded border-2 transition-all duration-150 ${
                isOos
                  ? "border-[#e0e0e0] text-[#ccc] cursor-not-allowed line-through bg-white"
                  : isSelected
                  ? "bg-[#FF9D3D] text-white border-[#FF9D3D]"
                  : "bg-white text-[#1a1a1a] border-[#e0e0e0] hover:border-[#1a1a1a] hover:text-[#1a1a1a] cursor-pointer"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
