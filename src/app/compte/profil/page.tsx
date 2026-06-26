"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Check, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

const EMPTY: Profile = { first_name: "", last_name: "", phone: "", address: "", city: "", zip: "", country: "France" };

export default function ProfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof Profile, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/compte?redirect=/compte/profil"); return; }

    getSupabase()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setForm({ ...EMPTY, ...data });
        else setForm({ ...EMPTY, first_name: user.user_metadata?.first_name || "", last_name: user.user_metadata?.last_name || "" });
        setLoading(false);
      });
  }, [user, authLoading, router]);

  const handleDelete = async () => {
    if (!user || deleteConfirm !== "SUPPRIMER") return;
    setDeleting(true);
    const { error } = await getSupabase().rpc("delete_user");
    if (error) {
      console.error("Erreur suppression compte:", error);
      setDeleting(false);
      alert("Une erreur est survenue lors de la suppression. Contacte le support.");
      return;
    }
    await getSupabase().auth.signOut();
    router.replace("/");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await getSupabase()
      .from("profiles")
      .upsert({ id: user.id, ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inputCls = "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] text-sm text-[#1a1a1a] outline-none focus:border-[#FF9D3D] transition-colors";
  const label = (text: string) => <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">{text}</label>;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link href="/compte" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mon compte
          </Link>
          <p className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-2">Paramètres</p>
          <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Mon profil
          </h1>
          <p className="text-white/40 text-sm mt-2">{user?.email}</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">

          {/* Identité */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-[#FF9D3D]" />
              <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-lg">Informations personnelles</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>{label("Prénom")}<input value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="Jean" className={inputCls} /></div>
              <div>{label("Nom")}<input value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Dupont" className={inputCls} /></div>
              <div className="sm:col-span-2">
                {label("Téléphone")}
                <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="06 12 34 56 78" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-lg mb-5">Adresse de livraison par défaut</h2>
            <div className="space-y-4">
              <div>{label("Adresse")}<input value={form.address} onChange={e => set("address", e.target.value)} placeholder="12 Rue de la Victoire" className={inputCls} /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>{label("Code postal")}<input value={form.zip} onChange={e => set("zip", e.target.value)} placeholder="75001" maxLength={5} className={inputCls} /></div>
                <div>{label("Ville")}<input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Paris" className={inputCls} /></div>
                <div>
                  {label("Pays")}
                  <select value={form.country} onChange={e => set("country", e.target.value)} className={inputCls}>
                    <option>France</option>
                    <option>Belgique</option>
                    <option>Suisse</option>
                    <option>Luxembourg</option>
                    <option>Allemagne</option>
                    <option>Espagne</option>
                    <option>Italie</option>
                    <option>Pays-Bas</option>
                    <option>Portugal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm py-4 rounded-xl transition-all ${
              saved ? "bg-green-500 text-white" : "bg-[#FF9D3D] hover:bg-[#FFB366] text-white"
            } disabled:opacity-60 cursor-pointer`}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</>
            ) : saved ? (
              <><Check className="w-4 h-4" /> Profil enregistré</>
            ) : (
              "Enregistrer le profil"
            )}
          </button>
        </form>

        {/* Zone de danger */}
        <div className="max-w-2xl mt-10 border border-red-200 rounded-xl overflow-hidden">
          <div className="bg-red-50 px-6 py-4 flex items-center gap-2 border-b border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-red-600 text-sm uppercase tracking-wider">Zone de danger</h2>
          </div>
          <div className="bg-white px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-[#1a1a1a] text-sm">Supprimer mon compte</p>
              <p className="text-[#999] text-xs mt-0.5">Cette action est irréversible. Toutes tes données seront supprimées.</p>
            </div>
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirm(""); }}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg text-sm font-bold transition-all cursor-pointer flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" /> Supprimer le compte
            </button>
          </div>
        </div>
      </div>

      {/* Modale de confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-red-50 px-6 py-5 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a]">Supprimer le compte</h3>
                <p className="text-red-500 text-xs font-semibold mt-0.5">Action irréversible</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-[#555] text-sm leading-relaxed">
                Ton compte, ton profil et tes données seront définitivement supprimés.
                Tes commandes passées resteront dans nos archives à des fins légales.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">
                  Tape <span className="text-red-500 font-mono">SUPPRIMER</span> pour confirmer
                </label>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg text-sm font-mono outline-none focus:border-red-400 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-lg border border-[#e0e0e0] text-[#1a1a1a] font-bold text-sm hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirm !== "SUPPRIMER" || deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
