"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, getColorImage } from "@/lib/utils";
import { ChevronRight, MapPin, Home, Tag, X, Loader2 } from "lucide-react";
import { supabase, getSupabase } from "@/lib/supabase";

interface PromoCode {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
}

interface AddressSuggestion {
  label: string;
  name: string;
  city: string;
  postcode: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
type DeliveryKey = "mondial_relay" | "colissimo" | "chronopost";

const FREE_THRESHOLD = 70;
const STANDARD_FEE = 3.99;
const EXPRESS_ADDON = 4.99;

interface DeliveryOption {
  label: string;
  sublabel: string;
  delay: string;
  basePrice: (total: number) => number;
  carrier: DeliveryKey;
  icon: React.ReactNode;
}

const DELIVERY_OPTIONS: Record<DeliveryKey, DeliveryOption> = {
  mondial_relay: {
    label: "Mondial Relay",
    sublabel: "Retrait en point relais · France & UE",
    delay: "3–5j France · 3–7j UE",
    basePrice: (total) => (total >= FREE_THRESHOLD ? 0 : STANDARD_FEE),
    carrier: "mondial_relay",
    icon: <MapPin className="w-4 h-4 text-[#e2001a]" />,
  },
  colissimo: {
    label: "Colissimo · La Poste",
    sublabel: "Livraison à domicile · France & UE",
    delay: "3–5j France · 3–7j UE",
    basePrice: (total) => (total >= FREE_THRESHOLD ? 0 : STANDARD_FEE),
    carrier: "colissimo",
    icon: <Home className="w-4 h-4 text-[#003189]" />,
  },
  chronopost: {
    label: "Chronopost",
    sublabel: "Livraison prioritaire · France uniquement",
    delay: "72h France",
    basePrice: (total) => (total >= FREE_THRESHOLD ? 0 : STANDARD_FEE) + EXPRESS_ADDON,
    carrier: "chronopost",
    icon: <Home className="w-4 h-4 text-[#0095DA]" />,
  },
};

function CarrierLogo({ carrier }: { carrier: DeliveryKey }) {
  if (carrier === "mondial_relay") {
    return (
      <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0">
        <img src="/carriers/mondial-relay.svg" alt="Mondial Relay" className="w-full h-full object-cover" />
      </div>
    );
  }
  if (carrier === "colissimo") {
    return (
      <div className="w-16 h-10 sm:w-32 sm:h-14 flex items-center justify-center flex-shrink-0 bg-white rounded-xl border border-[#e0e0e0] overflow-hidden p-1 sm:p-1.5">
        <img src="/carriers/colissimo.svg" alt="Colissimo" className="w-full h-full object-contain" />
      </div>
    );
  }
  return (
    <div className="w-16 h-10 sm:w-32 sm:h-14 flex items-center justify-center flex-shrink-0 bg-white rounded-xl border border-[#e0e0e0] overflow-hidden p-1 sm:p-1.5">
      <img src="/carriers/chronopost.png" alt="Chronopost" className="w-full h-full object-contain" />
    </div>
  );
}

const INITIAL: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", address2: "", city: "", zip: "", country: "France",
};

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.firstName.trim()) errors.firstName = "Requis";
  if (!data.lastName.trim()) errors.lastName = "Requis";
  if (!data.email.match(/^[^@]+@[^@]+\.[^@]+$/)) errors.email = "Email invalide";
  if (data.phone.trim()) {
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) errors.phone = "Numéro invalide (8 à 15 chiffres)";
  }
  if (!data.address.trim()) errors.address = "Requis";
  if (!data.city.trim()) errors.city = "Requis";
  if (!data.zip.match(/^\d{4,5}$/)) errors.zip = "Code postal invalide";
  return errors;
}

export default function CheckoutForm() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState<FormData>(INITIAL);

  // Pré-remplissage depuis le profil
  useEffect(() => {
    if (!user) return;
    getSupabase().from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => {
        setForm(prev => ({
          ...prev,
          email: user.email ?? prev.email,
          firstName: data?.first_name || prev.firstName,
          lastName: data?.last_name || prev.lastName,
          phone: data?.phone || prev.phone,
          address: data?.address || prev.address,
          address2: data?.address2 || prev.address2,
          city: data?.city || prev.city,
          zip: data?.zip || prev.zip,
          country: data?.country || prev.country,
        }));
      });
  }, [user]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [delivery, setDelivery] = useState<DeliveryKey>("mondial_relay");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressWrapperRef = useRef<HTMLDivElement>(null);

  // Ferme le dropdown si clic à l'extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFreeShipping = total >= FREE_THRESHOLD;
  const deliveryCost = DELIVERY_OPTIONS[delivery].basePrice(total);
  const promoDiscount = appliedPromo
    ? appliedPromo.discount_type === "percent"
      ? Math.round(total * appliedPromo.discount_value) / 100
      : Math.min(appliedPromo.discount_value, total)
    : 0;
  const orderTotal = Math.max(0, total + deliveryCost - promoDiscount);

  const applyPromoCode = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoInput.toUpperCase().trim())
      .eq("active", true)
      .single();

    if (error || !data) { setPromoError("Code invalide ou inexistant."); setPromoLoading(false); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setPromoError("Ce code a expiré."); setPromoLoading(false); return; }
    if (data.max_uses !== null && data.uses_count >= data.max_uses) { setPromoError("Ce code est épuisé."); setPromoLoading(false); return; }
    if (data.min_order && total < data.min_order) { setPromoError(`Commande minimum de ${formatPrice(data.min_order)} requise.`); setPromoLoading(false); return; }

    setAppliedPromo(data as PromoCode);
    setPromoLoading(false);
  };

  const removePromo = () => { setAppliedPromo(null); setPromoInput(""); setPromoError(""); };

  const handleAddressChange = (value: string) => {
    set("address", value);
    if (form.country !== "France" || value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    if (suggestRef.current) clearTimeout(suggestRef.current);
    suggestRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5&type=housenumber`);
        const json = await res.json();
        const results: AddressSuggestion[] = (json.features ?? []).map((f: { properties: { label: string; name: string; city: string; postcode: string } }) => ({
          label: f.properties.label,
          name: f.properties.name,
          city: f.properties.city,
          postcode: f.properties.postcode,
        }));
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const selectSuggestion = (s: AddressSuggestion) => {
    setForm(prev => ({ ...prev, address: s.name, city: s.city, zip: s.postcode }));
    setErrors(prev => ({ ...prev, address: undefined, city: undefined, zip: undefined }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const set = (key: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === "country" && val !== "France" && delivery === "chronopost") {
      setDelivery("colissimo");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone || undefined,
            address: form.address,
            address2: form.address2 || undefined,
            city: form.city,
            zip: form.zip,
            country: form.country,
          },
          items: items.map((item) => ({
            productId: item.product.id,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          delivery,
          promoCode: appliedPromo?.code ?? null,
          userId: user?.id ?? null,
        }),
      });
      const json = await res.json();
      if (!json.ok || !json.url) {
        setSubmitError(json.error ?? "Une erreur est survenue. Réessaie.");
        setSubmitting(false);
        return;
      }
      // Redirection externe vers Stripe — le panier n'est vidé qu'après paiement confirmé
      // (page de succès), pas ici, pour ne pas perdre le panier en cas d'abandon.
      window.location.href = json.url;
    } catch (err) {
      console.error("Erreur création session de paiement:", err);
      setSubmitError("Une erreur est survenue. Réessaie.");
      setSubmitting(false);
    }
  };

  const inputCls = (key: keyof FormData) =>
    `w-full px-4 py-3 rounded border text-sm outline-none transition-colors ${
      errors[key] ? "border-red-400 bg-red-50" : "border-[#e0e0e0] focus:border-[#FF9D3D] bg-[#f5f5f5]"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form — 3/5 */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal info */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-5">
              Informations personnelles
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                { key: "firstName", label: "Prénom", type: "text", placeholder: "Jean" },
                { key: "lastName", label: "Nom", type: "text", placeholder: "Dupont" },
                { key: "email", label: "Email", type: "email", placeholder: "jean@example.fr" },
                { key: "phone", label: "Téléphone (facultatif)", type: "tel", placeholder: "06 12 34 56 78" },
              ] as { key: keyof FormData; label: string; type: string; placeholder: string }[]).map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={inputCls(key)}
                  />
                  {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-5">
              Adresse de livraison
            </h2>
            <div className="space-y-4">
              {/* Adresse avec autocomplete API gouvernementale (France uniquement) */}
              <div ref={addressWrapperRef} className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                  Adresse
                  {form.country === "France" && <span className="text-[#FF9D3D] font-normal normal-case tracking-normal ml-2 text-[11px]">✦ Saisie automatique</span>}
                </label>
                <input
                  type="text"
                  placeholder="12 Rue de la Victoire"
                  value={form.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className={inputCls("address")}
                  autoComplete="off"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#e0e0e0] rounded-xl shadow-xl overflow-hidden">
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-[#fff8f3] border-b border-[#f5f5f5] last:border-0 transition-colors"
                        >
                          <span className="font-semibold text-[#1a1a1a]">{s.name}</span>
                          <span className="text-[#999] ml-2">{s.postcode} {s.city}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Complément d'adresse */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                  Complément d&apos;adresse <span className="text-[#999] font-normal normal-case tracking-normal">(facultatif)</span>
                </label>
                <input
                  type="text"
                  placeholder="Bât. B, Apt. 12, Étage 3…"
                  value={form.address2}
                  onChange={(e) => set("address2", e.target.value)}
                  className={inputCls("address2" as keyof FormData)}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">Code postal</label>
                  <input
                    type="text"
                    placeholder="75001"
                    value={form.zip}
                    onChange={(e) => set("zip", e.target.value)}
                    maxLength={5}
                    className={inputCls("zip")}
                  />
                  {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">Ville</label>
                  <input
                    type="text"
                    placeholder="Paris"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputCls("city")}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">Pays</label>
                  <select
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className="w-full px-4 py-3 rounded border border-[#e0e0e0] text-sm outline-none focus:border-[#FF9D3D] bg-[#f5f5f5]"
                  >
                    <option>France</option>
                    <option>Allemagne</option>
                    <option>Autriche</option>
                    <option>Belgique</option>
                    <option>Bulgarie</option>
                    <option>Chypre</option>
                    <option>Croatie</option>
                    <option>Danemark</option>
                    <option>Espagne</option>
                    <option>Estonie</option>
                    <option>Finlande</option>
                    <option>Grèce</option>
                    <option>Hongrie</option>
                    <option>Irlande</option>
                    <option>Italie</option>
                    <option>Lettonie</option>
                    <option>Lituanie</option>
                    <option>Luxembourg</option>
                    <option>Malte</option>
                    <option>Pays-Bas</option>
                    <option>Pologne</option>
                    <option>Portugal</option>
                    <option>République Tchèque</option>
                    <option>Roumanie</option>
                    <option>Slovaquie</option>
                    <option>Slovénie</option>
                    <option>Suède</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery options */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
              <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl">
                Mode de livraison
              </h2>
              {isFreeShipping && (
                <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded flex-shrink-0">
                  ✓ Livraison gratuite
                </span>
              )}
            </div>

            {!isFreeShipping && (
              <p className="text-xs text-[#999999] mb-4 bg-[#f5f5f5] rounded-lg px-3 py-2">
                🚚 Livraison gratuite à partir de <strong className="text-[#1a1a1a]">70€</strong> d&apos;achat
              </p>
            )}

            <div className="space-y-3">
              {(Object.entries(DELIVERY_OPTIONS) as [DeliveryKey, DeliveryOption][]).filter(([key]) => {
                if (key === "chronopost" && form.country !== "France") return false;
                return true;
              }).map(([key, opt]) => {
                const price = opt.basePrice(total);
                const isSelected = delivery === key;
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                      isSelected ? "border-[#FF9D3D] bg-orange-50" : "border-[#e0e0e0] hover:border-[#999999]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={key}
                      checked={isSelected}
                      onChange={() => setDelivery(key)}
                      className="accent-[#FF9D3D] flex-shrink-0"
                    />
                    <CarrierLogo carrier={key} />
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-[#1a1a1a] break-words">{opt.label}</div>
                        <div className="text-[11px] sm:text-xs text-[#999999] break-words">{opt.sublabel} · {opt.delay}</div>
                      </div>
                      <div className="flex-shrink-0">
                        {price === 0 ? (
                          <span className="font-bold text-xs sm:text-sm text-green-600">Gratuit</span>
                        ) : (
                          <span className="font-bold text-xs sm:text-sm text-[#FF9D3D]">+{formatPrice(price)}</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Code promo */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#FF9D3D]" /> Code promo
            </h2>
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-[#FF9D3D]/8 border border-[#FF9D3D]/30 rounded-lg px-4 py-3">
                <div>
                  <p className="font-mono font-black text-[#FF9D3D] tracking-widest text-sm">{appliedPromo.code}</p>
                  <p className="text-xs text-[#999] mt-0.5">
                    {appliedPromo.discount_type === "percent"
                      ? `-${appliedPromo.discount_value}% appliqué`
                      : `-${formatPrice(appliedPromo.discount_value)} appliqué`}
                  </p>
                </div>
                <button onClick={removePromo} className="text-[#999] hover:text-red-500 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyPromoCode())}
                  placeholder="TONCODE"
                  className="flex-1 px-4 py-3 rounded border border-[#e0e0e0] focus:border-[#FF9D3D] text-sm font-mono uppercase tracking-widest outline-none bg-[#f5f5f5] placeholder-[#ccc]"
                />
                <button
                  type="button" onClick={applyPromoCode} disabled={promoLoading || !promoInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-3 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-bold rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Appliquer"}
                </button>
              </div>
            )}
            {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
          </div>

          {submitError && (
            <p className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-3">{submitError}</p>
          )}
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-wider text-sm py-4 rounded transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirection vers le paiement…</>
            ) : (
              <>Procéder au paiement · {formatPrice(orderTotal)} <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        {/* Summary — 2/5 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0] sticky top-24">
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-5">
              Votre commande
            </h2>

            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                    {item.product.images[0] && (
                      <img src={getColorImage(item.product, item.color)} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a1a1a] truncate">{item.product.name}</p>
                    <p className="text-xs text-[#999999]">Taille : {item.size} · x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-[#1a1a1a] flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e0e0e0] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#999999]">Sous-total</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#999999]">Livraison</span>
                <span className={`font-semibold ${deliveryCost === 0 ? "text-green-600" : "text-[#1a1a1a]"}`}>
                  {deliveryCost === 0 ? "Gratuite" : formatPrice(deliveryCost)}
                </span>
              </div>
              {appliedPromo && promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#FF9D3D] font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> {appliedPromo.code}
                  </span>
                  <span className="font-bold text-[#FF9D3D]">-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-[#e0e0e0] pt-3 mt-1">
                <span className="font-condensed font-black uppercase text-[#1a1a1a]">Total</span>
                <span className="font-condensed font-black text-[#FF9D3D] text-xl">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e0e0e0] flex flex-col gap-1.5">
              {[
                "🔒 Paiement 100% sécurisé",
                "📦 Expédition sous 24h",
                "↩️ Retours acceptés sous 30j",
              ].map((line) => (
                <p key={line} className="text-[11px] text-[#999999]">{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
