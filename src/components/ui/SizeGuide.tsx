"use client";

import { useState } from "react";
import { X, Ruler } from "lucide-react";

const GUIDES = {
  clothing: {
    label: "Vêtements",
    headers: ["Taille", "Poitrine (cm)", "Tour de taille (cm)", "Hanches (cm)"],
    rows: [
      ["XS", "82–86", "64–68", "88–92"],
      ["S",  "86–90", "68–72", "92–96"],
      ["M",  "90–94", "72–76", "96–100"],
      ["L",  "94–98", "76–80", "100–104"],
      ["XL", "98–102","80–84", "104–108"],
      ["XXL","102–108","84–90","108–114"],
    ],
  },
  shoes: {
    label: "Chaussures",
    headers: ["Pointure EU", "Longueur pied (cm)", "UK", "US"],
    rows: [
      ["38", "24.0", "5",   "6"],
      ["39", "24.7", "5.5", "6.5"],
      ["40", "25.3", "6",   "7"],
      ["41", "26.0", "7",   "8"],
      ["42", "26.7", "7.5", "8.5"],
      ["43", "27.3", "8.5", "9.5"],
      ["44", "28.0", "9.5", "10.5"],
      ["45", "28.7", "10",  "11"],
      ["46", "29.3", "11",  "12"],
    ],
  },
};

interface SizeGuideProps {
  category: string;
}

export default function SizeGuide({ category }: SizeGuideProps) {
  const [open, setOpen] = useState(false);

  const isShoes = category.toLowerCase().includes("chaussure");
  const guide = isShoes ? GUIDES.shoes : GUIDES.clothing;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-[#999999] hover:text-[#FF9D3D] transition-colors cursor-pointer underline underline-offset-2"
      >
        <Ruler className="w-3.5 h-3.5" />
        Guide des tailles
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0]">
              <div>
                <h3 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl">
                  Guide des tailles
                </h3>
                <p className="text-xs text-[#999999] mt-0.5">{guide.label}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f5f5f5] hover:bg-[#e0e0e0] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#1a1a1a]" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-y-auto p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#1a1a1a]">
                    {guide.headers.map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row, i) => (
                    <tr key={i} className={`border-b border-[#f0f0f0] ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                      {row.map((cell, j) => (
                        <td key={j} className={`py-3 pr-4 text-sm ${j === 0 ? "font-bold text-[#FF9D3D]" : "text-[#333333]"}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-xs text-[#999999] mt-5 leading-relaxed">
                💡 <strong>Conseil :</strong> en cas de doute entre deux tailles, prends la plus grande.
                Pour les chaussures, mesure ton pied le soir — le pied gonfle légèrement dans la journée.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
