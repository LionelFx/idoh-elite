"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2, Eye, EyeOff, ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { PRESET_COLORS, getColorName } from "@/lib/colors";
import ProductPreview from "./ProductPreview";
import { AiRewriteButton } from "./AiButtons";
import ImageCropModal from "./ImageCropModal";

const CATEGORIES = [
  { label: "Maillot",      id: "1" },
  { label: "Chaussure",    id: "2" },
  { label: "Survêtement",  id: "3" },
  { label: "T-shirt",      id: "4" },
  { label: "Essentiel",    id: "5" },
];

const SIZES_BY_CAT: Record<string, string[]> = {
  "1": ["XS","S","M","L","XL","XXL"],
  "2": ["36","37","38","39","40","41","42","43","44","45","46","47"],
  "3": ["XS","S","M","L","XL","XXL"],
  "4": ["XS","S","M","L","XL","XXL"],
  "5": ["XS","S","M","L","XL","XXL"],
};

interface ProductData {
  id?: string;
  name: string;
  price: string;
  discount_percent: string;
  description: string;
  category: string;
  category_id: string;
  brand: string;
  rating: string;
  reviews_count: string;
  stock_by_size: Record<string, number>;
  stock_by_color: Record<string, number>;
  stock_by_variant: Record<string, Record<string, number>>;
  colors: string[];
  images: string[];
  color_images: Record<string, string>;
  is_featured: boolean;
}

const EMPTY: ProductData = {
  name: "", price: "", discount_percent: "0", description: "", category: "Maillot", category_id: "1",
  brand: "", rating: "4.5", reviews_count: "0",
  stock_by_size: {}, stock_by_color: {}, stock_by_variant: {}, colors: [], images: [], color_images: {},
  is_featured: false,
};

// Produit existant à 1 seule couleur, jamais rempli via la grille (avant son existence) :
// on projette stock_by_size sur cette couleur pour ne pas perdre les quantités déjà saisies.
// Pour 2+ couleurs, aucune projection sûre n'est possible (l'ancien stock_by_color était
// indépendant et souvent incohérent) — l'admin ressaisit la grille une fois.
function buildInitialForm(initial?: Partial<ProductData>): ProductData {
  const merged = { ...EMPTY, ...initial };
  if (
    merged.colors.length === 1 &&
    Object.keys(merged.stock_by_variant).length === 0 &&
    Object.keys(merged.stock_by_size).length > 0
  ) {
    const defaultColor = merged.colors[0];
    const stock_by_variant: Record<string, Record<string, number>> = {};
    Object.entries(merged.stock_by_size).forEach(([size, qty]) => {
      stock_by_variant[size] = { [defaultColor]: qty };
    });
    return { ...merged, stock_by_variant };
  }
  return merged;
}

export default function ProductForm({ initial }: { initial?: Partial<ProductData> }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>(() => buildInitialForm(initial));
  const [customColor, setCustomColor] = useState("#FF9D3D");
  const [uploading, setUploading] = useState(false);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [colorCropFile, setColorCropFile] = useState<{ color: string; file: File } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const set = (key: keyof ProductData, val: string | boolean | string[] | Record<string, number | string>) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const setVariantQty = (size: string, color: string, qty: number) =>
    setForm(prev => ({
      ...prev,
      stock_by_variant: {
        ...prev.stock_by_variant,
        [size]: { ...prev.stock_by_variant[size], [color]: Math.max(0, qty) },
      },
    }));

  const addColor = (hex: string) => {
    if (!form.colors.includes(hex))
      setForm(prev => ({ ...prev, colors: [...prev.colors, hex] }));
  };

  const removeColor = (c: string) =>
    setForm(prev => {
      const ci = { ...prev.color_images };
      delete ci[c];
      return { ...prev, colors: prev.colors.filter(x => x !== c), color_images: ci };
    });

  const moveImage = (idx: number, dir: -1 | 1) =>
    setForm(prev => {
      const imgs = [...prev.images];
      const target = idx + dir;
      if (target < 0 || target >= imgs.length) return prev;
      [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
      // Mise à jour des color_images si une URL a bougé
      const ci: Record<string, string> = {};
      Object.entries(prev.color_images).forEach(([color, url]) => { ci[color] = url; });
      return { ...prev, images: imgs, color_images: ci };
    });

  const setColorImage = (color: string, imageUrl: string) =>
    setForm(prev => ({
      ...prev,
      color_images: { ...prev.color_images, [color]: imageUrl },
    }));

  const removeColorImage = (color: string) =>
    setForm(prev => {
      const ci = { ...prev.color_images };
      delete ci[color];
      return { ...prev, color_images: ci };
    });

  const uploadBlob = async (blob: Blob, folder = ""): Promise<string | null> => {
    const sb = getSupabase();
    const path = `${folder}${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const { error: upErr } = await sb.storage.from("products").upload(path, blob, { upsert: true, contentType: "image/webp" });
    if (upErr) return null;
    const { data } = sb.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleColorFileSelect = (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setColorCropFile({ color, file });
  };

  const handleColorCropConfirm = async (blob: Blob) => {
    if (!colorCropFile) return;
    const { color } = colorCropFile;
    setColorCropFile(null);
    setUploadingColor(color);
    const url = await uploadBlob(blob, "colors/");
    if (url) setColorImage(color, url);
    setUploadingColor(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setCropQueue(prev => [...prev, ...files]);
  };

  const handleCropConfirm = async (blob: Blob) => {
    setUploading(true);
    const url = await uploadBlob(blob);
    if (url) setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    setCropQueue(prev => prev.slice(1));
    setUploading(false);
  };

  const handleCropCancel = () => setCropQueue(prev => prev.slice(1));

  const removeImage = (url: string) =>
    setForm(prev => {
      const ci = { ...prev.color_images };
      Object.keys(ci).forEach(color => { if (ci[color] === url) delete ci[color]; });
      return { ...prev, images: prev.images.filter(i => i !== url), color_images: ci };
    });

  const handleCategoryChange = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId)!;
    setForm(prev => ({ ...prev, category_id: catId, category: cat.label }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) { setError("Remplis tous les champs obligatoires."); return; }
    setSaving(true);
    setError("");

    // 2+ couleurs : la grille taille×couleur est la source de vérité, stock_by_size/
    // stock_by_color/stock en sont dérivés. Sinon (0 ou 1 couleur) : comportement historique,
    // stock_by_size reste la source de vérité.
    const useVariantGrid = form.colors.length > 0;
    let stock_by_size = form.stock_by_size;
    let stock_by_color = form.stock_by_color;
    let stock_by_variant: Record<string, Record<string, number>> = {};
    let totalStock: number;

    if (useVariantGrid) {
      stock_by_variant = form.stock_by_variant;
      const bySize: Record<string, number> = {};
      const byColor: Record<string, number> = {};
      let total = 0;
      Object.entries(form.stock_by_variant).forEach(([size, colorMap]) => {
        Object.entries(colorMap).forEach(([color, qty]) => {
          bySize[size] = (bySize[size] ?? 0) + qty;
          byColor[color] = (byColor[color] ?? 0) + qty;
          total += qty;
        });
      });
      stock_by_size = bySize;
      stock_by_color = byColor;
      totalStock = total;
    } else {
      totalStock = Object.values(form.stock_by_size).reduce((s, q) => s + q, 0);
    }

    const availableSizes = Object.entries(stock_by_size)
      .filter(([, qty]) => qty > 0)
      .map(([size]) => size);

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      discount_percent: parseInt(form.discount_percent) || 0,
      description: form.description,
      category: form.category,
      category_id: form.category_id,
      brand: form.brand,
      stock: totalStock,
      stock_by_size,
      stock_by_color,
      stock_by_variant,
      rating: parseFloat(form.rating),
      reviews_count: parseInt(form.reviews_count),
      sizes: availableSizes,
      colors: form.colors,
      images: form.images,
      color_images: form.color_images,
      is_featured: form.is_featured,
    };

    const sb = getSupabase();
    const { error: saveError } = form.id
      ? await sb.from("products").update(payload).eq("id", form.id)
      : await sb.from("products").insert({ id: `p_${Date.now()}`, ...payload });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  const generateDescription = async () => {
    if (!form.name) return;
    setGeneratingDesc(true);
    const res = await fetch("/api/ai/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, category: form.category, brand: form.brand, type: "product" }),
    });
    const json = await res.json();
    if (json.ok) set("description", json.text);
    setGeneratingDesc(false);
  };

  const sizes = SIZES_BY_CAT[form.category_id] ?? SIZES_BY_CAT["1"];

  // En mode grille (1+ couleur), stock_by_size n'est plus tenu à jour dans `form` — l'aperçu
  // doit refléter la grille en temps réel, pas le payload calculé seulement à la soumission.
  const previewProduct = form.colors.length > 0
    ? { ...form, stock_by_size: Object.fromEntries(
        Object.entries(form.stock_by_variant).map(([size, colorMap]) => [size, Object.values(colorMap).reduce((s, q) => s + q, 0)])
      ) }
    : form;

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors";
  const labelCls = "text-white/50 text-xs uppercase tracking-wider block mb-2";

  return (
    <div>
      {/* Toggle preview — mobile uniquement */}
      <div className="flex items-center justify-end mb-4 xl:hidden">
        <button type="button" onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-[#FF9D3D] text-sm font-semibold transition-colors cursor-pointer">
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? "Masquer l'aperçu" : "Prévisualiser"}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Formulaire — masqué sur mobile si preview ouvert */}
        <div className={`flex-1 min-w-0 ${showPreview ? "hidden xl:block" : "block"}`}>
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Nom */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Nom du produit *</label>
            <AiRewriteButton getText={() => form.name} onResult={v => set("name", v)} type="product-name" disabled={!form.name.trim()} />
          </div>
          <input value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="ex: Air Jordan 4 × KAWS" className={inputCls} required />
        </div>

        {/* Catégorie */}
        <div>
          <label className={labelCls}>Catégorie *</label>
          <select value={form.category_id} onChange={e => handleCategoryChange(e.target.value)}
            className={inputCls}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {/* Marque */}
        <div>
          <label className={labelCls}>Marque</label>
          <input value={form.brand} onChange={e => set("brand", e.target.value)}
            placeholder="ex: Nike, Jordan, Louis Vuitton…" className={inputCls} />
        </div>

        {/* Prix */}
        <div>
          <label className={labelCls}>Prix (€) *</label>
          <input type="number" step="0.01" min="0" value={form.price} onChange={e => set("price", e.target.value)}
            placeholder="129.99" className={inputCls} required />
        </div>

        {/* Réduction */}
        <div>
          <label className={labelCls}>Réduction produit (%)</label>
          <div className="relative">
            <input
              type="number" min="0" max="100" value={form.discount_percent}
              onChange={e => set("discount_percent", e.target.value)}
              placeholder="0" className={`${inputCls} pr-10`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">%</span>
          </div>
          {parseInt(form.discount_percent) > 0 && form.price && (
            <p className="text-[#FF9D3D] text-xs mt-1.5 font-semibold">
              Prix affiché : {(parseFloat(form.price) * (1 - parseInt(form.discount_percent) / 100)).toFixed(2)} € <span className="text-white/30 line-through ml-1">{parseFloat(form.price).toFixed(2)} €</span>
            </p>
          )}
          <p className="text-white/25 text-xs mt-1">Indépendant des codes promos — laisse à 0 si pas de solde.</p>
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Description *</label>
            <div className="flex items-center gap-2">
              <AiRewriteButton getText={() => form.description} onResult={v => set("description", v)} type="product" disabled={!form.description.trim()} />
              <button type="button" onClick={generateDescription}
                disabled={generatingDesc || !form.name}
                title={!form.name ? "Remplis le nom du produit d'abord" : "Générer avec l'IA"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9D3D]/10 hover:bg-[#FF9D3D]/20 border border-[#FF9D3D]/30 hover:border-[#FF9D3D]/60 text-[#FF9D3D] text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {generatingDesc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generatingDesc ? "Génération…" : "Générer"}
              </button>
            </div>
          </div>
          <textarea value={form.description} onChange={e => set("description", e.target.value)}
            rows={4} placeholder="Décris le produit… ou génère avec l'IA ↑" className={`${inputCls} resize-none`} required />
        </div>
      </div>

      {/* Couleurs — avant le stock, pour ne pas faire remplir "Stock par taille" puis le
          remplacer par la grille dès qu'une 2e couleur est ajoutée (contradiction signalée
          par l'utilisateur) */}
      <div>
        <label className={labelCls}>Couleurs</label>

        {/* Couleurs sélectionnées */}
        {form.colors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {form.colors.map(c => (
              <div key={c} className="flex items-center gap-1.5 bg-[#1e1e1e] border border-white/10 rounded-lg px-2.5 py-1.5">
                <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c }} />
                <span className="text-white/60 text-xs">{getColorName(c)}</span>
                <button type="button" onClick={() => removeColor(c)} className="text-white/30 hover:text-red-400 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {form.colors.length >= 2 && (
          <p className="text-amber-400/80 text-xs bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2 mb-4">
            ⚠️ Plusieurs couleurs sur cette fiche : évite de nommer une couleur précise dans le nom ou la description du produit (ex. « Triple Black ») — ils sont partagés par toutes les couleurs et resteraient affichés même pour les autres.
          </p>
        )}

        {/* Palette prédéfinie */}
        <div className="mb-3">
          <p className="text-white/30 text-xs mb-2">Couleurs prédéfinies — clique pour ajouter</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(({ hex, name }) => {
              const already = form.colors.includes(hex);
              return (
                <button key={hex} type="button" onClick={() => already ? removeColor(hex) : addColor(hex)}
                  title={name}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all cursor-pointer group ${
                    already ? "border-[#FF9D3D] scale-110" : "border-white/10 hover:border-white/40 hover:scale-110"
                  }`}
                  style={{ backgroundColor: hex }}>
                  {already && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[#FF9D3D] shadow-sm" />
                    </span>
                  )}
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Couleur personnalisée */}
        <div className="flex items-center gap-2 mt-6">
          <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-white/10 bg-[#1e1e1e] cursor-pointer p-0.5 flex-shrink-0" />
          <input value={customColor} onChange={e => setCustomColor(e.target.value)}
            className="w-24 bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono outline-none focus:border-[#FF9D3D]" />
          <button type="button" onClick={() => addColor(customColor)}
            disabled={form.colors.includes(customColor)}
            className="bg-[#1e1e1e] border border-white/10 hover:border-[#FF9D3D] text-white/50 hover:text-[#FF9D3D] px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-30">
            + Couleur custom
          </button>
        </div>
      </div>

      {/* Stock — nécessite au moins une couleur ; la grille gère 1 colonne ou plus, pas de
          vue intermédiaire "stock par taille seul" qui serait remplacée juste après */}
      {form.colors.length === 0 ? (
        <p className="text-white/25 text-xs italic">
          Ajoute une couleur ci-dessus pour définir le stock par taille.
        </p>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Stock par taille{form.colors.length > 1 ? " × couleur" : ""}</label>
            <span className="text-white/30 text-xs">
              Total : {Object.values(form.stock_by_variant).reduce((s, m) => s + Object.values(m).reduce((s2, q) => s2 + q, 0), 0)} ex.
            </span>
          </div>
          <p className="text-white/25 text-xs mb-3">
            Une case à 0 = cette {form.colors.length > 1 ? "combinaison" : "taille"} n&apos;est pas disponible à la vente.
          </p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-white/40 text-[10px] font-bold uppercase tracking-wider pb-2 pr-3">Taille</th>
                  {form.colors.map(color => {
                    const preset = PRESET_COLORS.find(p => p.hex.toLowerCase() === color.toLowerCase());
                    return (
                      <th key={color} className="pb-2 px-1.5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-white/40 text-[9px] truncate max-w-[56px]">{preset?.name ?? color}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sizes.map(size => (
                  <tr key={size} className="border-t border-white/8">
                    <td className="text-white/70 text-xs font-bold py-1.5 pr-3 whitespace-nowrap">{size}</td>
                    {form.colors.map(color => {
                      const qty = form.stock_by_variant[size]?.[color] ?? 0;
                      return (
                        <td key={color} className="px-1.5 py-1">
                          <input
                            type="number" min="0" value={qty}
                            onChange={e => setVariantQty(size, color, parseInt(e.target.value) || 0)}
                            className={`w-14 text-center bg-[#1e1e1e] border rounded-lg px-1 py-1.5 text-white text-xs outline-none focus:border-[#FF9D3D] ${
                              qty > 0 ? "border-[#FF9D3D]/40" : "border-white/10"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Images */}
      <div>
        <label className={labelCls}>Photos du produit</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.images.map((url, i) => (
            <div key={url} className="flex flex-col items-center gap-1">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group">
                <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                <button type="button" onClick={() => removeImage(url)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <X className="w-5 h-5 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-[#FF9D3D] text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                    Principale
                  </span>
                )}
              </div>
              {/* Boutons réordonnancement */}
              <div className="flex gap-1">
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                  className="w-6 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1}
                  className="w-6 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-[#FF9D3D]/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-white/30" />
                <span className="text-white/30 text-[10px]">Ajouter</span>
              </>
            )}
          </label>
        </div>
        <p className="text-white/25 text-xs">La première photo sera l&apos;image principale. ◀ ▶ pour réordonner. JPG, PNG, WebP.</p>
      </div>

      {/* Photo par couleur — upload indépendant (skip la 1ère couleur = défaut) */}
      {form.colors.length > 1 && (
        <div>
          <label className={labelCls}>Photo par couleur</label>
          <p className="text-white/30 text-xs mb-3">
            La 1ère couleur utilise déjà les photos principales. Upload une photo pour chaque couleur supplémentaire. Clique sur la photo pour la supprimer.
          </p>
          <div className="space-y-2">
            {form.colors.slice(1).map(color => {
              const preset = PRESET_COLORS.find(p => p.hex.toLowerCase() === color.toLowerCase());
              const assigned = form.color_images[color];
              const isUploading = uploadingColor === color;

              return (
                <div key={color} className="flex items-center gap-3 bg-[#1e1e1e] border border-white/8 rounded-xl px-4 py-3">
                  {/* Couleur label */}
                  <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-white/60 text-xs truncate">{preset?.name ?? color}</span>
                  </div>

                  <span className="text-white/20 text-xs flex-shrink-0">→</span>

                  {/* Photo assignée OU bouton upload */}
                  {assigned ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#FF9D3D]/60 group cursor-pointer flex-shrink-0"
                      onClick={() => removeColorImage(color)} title="Cliquer pour supprimer">
                      <Image src={assigned} alt={`Photo ${preset?.name ?? color}`} fill className="object-cover" sizes="56px" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                        <X className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <label className={`w-14 h-14 rounded-xl border-2 border-dashed border-white/20 hover:border-[#FF9D3D]/50 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors flex-shrink-0 ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                      <input type="file" accept="image/*" onChange={e => handleColorFileSelect(color, e)} className="hidden" />
                      {isUploading
                        ? <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                        : <>
                            <Upload className="w-4 h-4 text-white/30" />
                            <span className="text-white/25 text-[9px]">Photo</span>
                          </>
                      }
                    </label>
                  )}

                  {/* Statut */}
                  <span className={`text-xs ml-1 ${assigned ? "text-[#FF9D3D]" : "text-white/20"}`}>
                    {assigned ? "✓ Photo ajoutée" : "Aucune photo"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mise en avant homepage */}
      <div className="flex items-center justify-between bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <Star className={`w-4 h-4 flex-shrink-0 ${form.is_featured ? "fill-[#FF9D3D] text-[#FF9D3D]" : "text-white/30"}`} />
          <div>
            <p className="text-white text-sm font-semibold">Mettre en avant sur la page d&apos;accueil</p>
            <p className="text-white/30 text-xs mt-0.5">Affiché dans la section &quot;Meilleures ventes&quot; de l&apos;accueil.</p>
          </div>
        </div>
        <button type="button" onClick={() => set("is_featured", !form.is_featured)}
          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.is_featured ? "bg-[#FF9D3D]" : "bg-white/15"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.is_featured ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/8">
        <button type="button" onClick={() => router.push("/admin/products")}
          className="px-6 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-sm font-semibold transition-colors cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {form.id ? "Enregistrer les modifications" : "Publier le produit"}
        </button>
      </div>
    </form>
        </div>

        {/* Preview panel — toujours visible sur xl, toggle sur mobile */}
        <div className={`w-[380px] flex-shrink-0 ${showPreview ? "block xl:block" : "hidden xl:block"}`}>
          <ProductPreview product={previewProduct} />
        </div>
      </div>

      {cropQueue.length > 0 && (
        <ImageCropModal
          key={`${cropQueue[0].name}-${cropQueue[0].lastModified}-${cropQueue.length}`}
          file={cropQueue[0]}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}

      {colorCropFile && (
        <ImageCropModal
          key={`${colorCropFile.color}-${colorCropFile.file.lastModified}`}
          file={colorCropFile.file}
          onCancel={() => setColorCropFile(null)}
          onConfirm={handleColorCropConfirm}
        />
      )}
    </div>
  );
}
