import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de retours | iDoh ELITE",
  description: "Conditions de retour et de remboursement chez iDoh ELITE — 30 jours pour changer d'avis.",
};

const sectionTitle = "font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-3";
const sectionBody = "text-[#555] text-sm leading-relaxed space-y-3";

export default function PolitiqueRetoursPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Informations légales</span>
          <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Politique de retours
          </h1>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">

        <section>
          <h2 className={sectionTitle}>30 jours pour changer d&apos;avis</h2>
          <div className={sectionBody}>
            <p>
              Chez iDoh ELITE, tu as <strong className="text-[#1a1a1a]">30 jours à compter de la réception de ta commande</strong> pour
              nous retourner un article qui ne te convient pas — un délai plus généreux que le délai légal de rétractation de 14 jours.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Conditions du retour</h2>
          <div className={sectionBody}>
            <p>Pour être accepté, l&apos;article retourné doit :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>n&apos;avoir jamais été porté, lavé ou modifié ;</li>
              <li>conserver toutes ses étiquettes d&apos;origine ;</li>
              <li>être renvoyé dans son emballage d&apos;origine, en parfait état.</li>
            </ul>
            <p>
              Un article ne respectant pas ces conditions pourra être refusé et renvoyé au Client à ses frais.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Comment retourner un article</h2>
          <div className={sectionBody}>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Contacte-nous à <a href="mailto:idohelite@gmail.com" className="text-[#FF9D3D] hover:underline">idohelite@gmail.com</a>{" "}
                en indiquant ton numéro de commande et le ou les articles concernés.
              </li>
              <li>Nous te confirmons l&apos;éligibilité du retour et te communiquons l&apos;adresse de retour.</li>
              <li>Renvoie le ou les articles dans les conditions décrites ci-dessus.</li>
            </ol>
            <p>
              Les frais de retour sont à la charge du Client, sauf en cas d&apos;article défectueux ou non conforme à la commande, où ils
              sont intégralement pris en charge par iDoh ELITE.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Remboursement</h2>
          <div className={sectionBody}>
            <p>
              Une fois le retour reçu et vérifié, le remboursement est effectué via Stripe, sur le moyen de paiement utilisé lors de la
              commande, dans un délai habituel de quelques jours ouvrés. Les frais de livraison initiaux ne sont remboursés que si le
              retour concerne la totalité de la commande.
            </p>
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Commande pas encore expédiée ?</h2>
          <div className={sectionBody}>
            <p>
              Si ta commande n&apos;a pas encore été expédiée, tu peux l&apos;annuler directement depuis ton espace{" "}
              <Link href="/compte/commandes" className="text-[#FF9D3D] hover:underline">Mes commandes</Link> — le remboursement est alors
              déclenché immédiatement, sans avoir besoin de nous retourner quoi que ce soit.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
