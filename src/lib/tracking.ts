const CARRIER_LABELS: Record<string, string> = {
  colissimo: "Colissimo",
  chronopost: "Chronopost",
  mondial_relay: "Mondial Relay",
};

export function getCarrierLabel(deliveryMethod: string): string {
  return CARRIER_LABELS[deliveryMethod] ?? deliveryMethod.replace(/_/g, " ");
}

// URLs non garanties à 100% (paramètres non confirmés officiellement pour Chronopost et
// Mondial Relay) — elles ramènent au moins vers la bonne page de suivi même si
// l'auto-remplissage par paramètres échoue. Colissimo (La Poste) est la plus fiable des trois.
export function getTrackingUrl(deliveryMethod: string, trackingNumber: string | null, zip?: string | null): string | null {
  if (!trackingNumber) return null;
  if (deliveryMethod === "colissimo") {
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
  }
  if (deliveryMethod === "chronopost") {
    return `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encodeURIComponent(trackingNumber)}`;
  }
  if (deliveryMethod === "mondial_relay") {
    return zip
      ? `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(trackingNumber)}&codePostal=${encodeURIComponent(zip)}`
      : `https://www.mondialrelay.fr/suivi-de-colis/`;
  }
  return null;
}
