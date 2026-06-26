import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | iDoh ELITE",
  description: "Conditions générales de vente du site iDoh ELITE.",
};

const sectionTitle = "font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-3";
const sectionBody = "text-[#555] text-sm leading-relaxed space-y-3";
const placeholder = "bg-[#FF9D3D]/10 text-[#b5651d] px-1.5 py-0.5 rounded font-semibold";

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Informations légales</span>
          <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Conditions générales de vente
          </h1>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">

        <section>
          <h2 className={sectionTitle}>1. Objet</h2>
          <div className={sectionBody}>
            <p>
              Les présentes conditions générales de vente régissent les ventes effectuées sur le site iDoh ELITE entre{" "}
              <span className={placeholder}>[Nom / raison sociale à compléter]</span> (« le Vendeur ») et toute personne physique
              effectuant un achat sur le site (« le Client »). Le fait de passer commande implique l&apos;acceptation pleine et entière
              des présentes conditions.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>2. Produits et prix</h2>
          <div className={sectionBody}>
            <p>
              Les produits proposés sont décrits et présentés avec la plus grande précision possible. Les prix sont indiqués en euros,
              toutes taxes comprises (TTC), hors frais de livraison qui sont précisés avant validation de la commande. iDoh ELITE se
              réserve le droit de modifier ses prix à tout moment, les produits étant facturés sur la base du prix en vigueur au moment
              de la validation de la commande.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>3. Commande et paiement</h2>
          <div className={sectionBody}>
            <p>
              La commande est validée après sélection des produits, renseignement de l&apos;adresse de livraison et paiement intégral
              du montant dû. Le paiement est traité de manière sécurisée par Stripe (carte bancaire). La commande n&apos;est définitivement
              enregistrée qu&apos;après confirmation du paiement par Stripe ; un email de confirmation est alors envoyé au Client.
            </p>
            <p>
              Un code promotionnel peut être appliqué avant le paiement, sous réserve de validité et des conditions propres à chaque code.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>4. Livraison</h2>
          <div className={sectionBody}>
            <p>iDoh ELITE livre en France métropolitaine et dans l&apos;Union Européenne, selon le mode de livraison choisi :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Mondial Relay</strong> (retrait en point relais) — 3,99 € (gratuit dès 70 € d&apos;achat), 3–5 jours en France, 3–7 jours en UE.</li>
              <li><strong>Colissimo · La Poste</strong> (livraison à domicile) — 3,99 € (gratuit dès 70 € d&apos;achat), 3–5 jours en France, 3–7 jours en UE.</li>
              <li><strong>Chronopost</strong> (livraison prioritaire, France uniquement) — 3,99 € + 4,99 € (gratuit dès 70 € d&apos;achat hors supplément express), sous 72h.</li>
            </ul>
            <p>
              Les délais sont donnés à titre indicatif et courent à compter de la confirmation de la commande. Un numéro de suivi est
              communiqué au Client dès l&apos;expédition de sa commande.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>5. Droit de rétractation</h2>
          <div className={sectionBody}>
            <p>
              Conformément à l&apos;article L221-18 du Code de la consommation, le Client dispose d&apos;un délai de 14 jours à compter
              de la réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motif ni à supporter
              d&apos;autres frais que ceux de retour des produits.
            </p>
            <p>
              Pour exercer ce droit, le Client doit notifier sa décision à iDoh ELITE par email à{" "}
              <a href="mailto:idohelite@gmail.com" className="text-[#FF9D3D] hover:underline">idohelite@gmail.com</a> avant l&apos;expiration
              du délai, puis retourner les produits dans les conditions décrites dans notre{" "}
              <Link href="/politique-retours" className="text-[#FF9D3D] hover:underline">politique de retours</Link>.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>6. Retours et remboursements</h2>
          <div className={sectionBody}>
            <p>
              Indépendamment du droit de rétractation légal de 14 jours, iDoh ELITE accepte les retours sous 30 jours à compter de la
              réception de la commande, dans les conditions détaillées sur la page{" "}
              <Link href="/politique-retours" className="text-[#FF9D3D] hover:underline">Politique de retours</Link>.
            </p>
            <p>
              En cas d&apos;annulation ou de retour validé, le remboursement est effectué via Stripe, sur le même moyen de paiement que
              celui utilisé lors de la commande, dans un délai habituel de quelques jours ouvrés.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>7. Garanties légales</h2>
          <div className={sectionBody}>
            <p>
              Tous les produits vendus sur iDoh ELITE bénéficient de la garantie légale de conformité (articles L217-3 et suivants du
              Code de la consommation) et de la garantie légale contre les défauts cachés (articles 1641 et suivants du Code civil).
              À ce titre, le Client peut obtenir la réparation, le remplacement ou le remboursement d&apos;un produit défectueux ou non
              conforme, sans frais à sa charge.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>8. Responsabilité</h2>
          <div className={sectionBody}>
            <p>
              iDoh ELITE ne pourra être tenu responsable des dommages résultant d&apos;une mauvaise utilisation des produits achetés,
              ni des retards de livraison imputables au transporteur ou à des cas de force majeure.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>9. Médiation et litiges</h2>
          <div className={sectionBody}>
            <p>
              En cas de litige, le Client est invité à contacter iDoh ELITE en priorité afin de trouver une solution amiable. À défaut
              d&apos;accord, le Client peut recourir gratuitement à un médiateur de la consommation{" "}
              <span className={placeholder}>[nom et coordonnées du médiateur à compléter — dépend du statut juridique]</span>, ou à la
              plateforme européenne de règlement en ligne des litiges (RLL) pour les achats effectués en ligne dans l&apos;Union Européenne.
            </p>
            <p>Les présentes conditions sont soumises au droit français.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
