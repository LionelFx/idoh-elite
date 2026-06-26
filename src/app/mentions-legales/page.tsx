import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | iDoh ELITE",
  description: "Mentions légales du site iDoh ELITE.",
};

const sectionTitle = "font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-3";
const sectionBody = "text-[#555] text-sm leading-relaxed space-y-3";
const placeholder = "bg-[#FF9D3D]/10 text-[#b5651d] px-1.5 py-0.5 rounded font-semibold";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Informations légales</span>
          <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Mentions légales
          </h1>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">

        <section>
          <h2 className={sectionTitle}>Éditeur du site</h2>
          <div className={sectionBody}>
            <p>
              Le site iDoh ELITE est édité par : <span className={placeholder}>[Nom / raison sociale à compléter]</span>,{" "}
              <span className={placeholder}>[statut juridique à compléter]</span>,
              immatriculé(e) sous le numéro SIRET <span className={placeholder}>[SIRET à compléter]</span>,
              dont le siège est situé <span className={placeholder}>[adresse à compléter]</span>.
            </p>
            <p>
              <span className={placeholder}>[Mention TVA à compléter — assujetti avec numéro de TVA intracommunautaire, ou « TVA non applicable, art. 293 B du CGI » si en franchise en base]</span>
            </p>
            <p>Responsable de la publication : <span className={placeholder}>[Nom à compléter]</span>.</p>
            <p>
              Contact : <a href="mailto:idohelite@gmail.com" className="text-[#FF9D3D] hover:underline">idohelite@gmail.com</a> · <a href="tel:+33759887600" className="text-[#FF9D3D] hover:underline">+33 7 59 88 76 00</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Hébergement</h2>
          <div className={sectionBody}>
            <p>
              Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Propriété intellectuelle</h2>
          <div className={sectionBody}>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, logos, structure) est protégé par le droit de la propriété intellectuelle.
              Toute reproduction, totale ou partielle, sans autorisation préalable est interdite. Les marques et produits présentés
              appartiennent à leurs propriétaires respectifs et sont mentionnés à titre informatif.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Données personnelles</h2>
          <div className={sectionBody}>
            <p>
              Les informations collectées sur ce site (commande, création de compte, newsletter, formulaire de contact) sont utilisées
              uniquement pour le traitement des commandes, la gestion du compte client et, si tu y as consenti, l&apos;envoi de notre newsletter.
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, tu disposes
              d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition concernant tes données personnelles.
            </p>
            <p>
              Pour exercer ce droit, contacte-nous à <a href="mailto:idohelite@gmail.com" className="text-[#FF9D3D] hover:underline">idohelite@gmail.com</a>.
              Le désabonnement à la newsletter est possible à tout moment via le lien présent dans chaque email.
            </p>
            <p>
              Le paiement est traité directement par Stripe ; iDoh ELITE ne stocke aucune donnée de carte bancaire.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Cookies</h2>
          <div className={sectionBody}>
            <p>
              Ce site utilise des cookies techniques nécessaires à son fonctionnement (panier, connexion à ton compte). Aucun cookie
              publicitaire tiers n&apos;est utilisé à ce jour.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
