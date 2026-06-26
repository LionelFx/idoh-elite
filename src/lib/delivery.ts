export type DeliveryKey = "mondial_relay" | "colissimo" | "chronopost";

const FREE_THRESHOLD = 70;
const STANDARD_FEE = 3.99;
const EXPRESS_ADDON = 4.99;

export const DELIVERY_LABELS: Record<DeliveryKey, string> = {
  mondial_relay: "Mondial Relay",
  colissimo: "Colissimo · La Poste",
  chronopost: "Chronopost",
};

// Logique de prix dupliquée à l'identique depuis CheckoutForm.tsx (qui ne peut pas être
// importé côté serveur — il contient du JSX/icônes). Recalculée serveur pour ne jamais
// faire confiance au montant envoyé par le client.
export function getDeliveryCost(delivery: DeliveryKey, subtotal: number): number {
  const base = subtotal >= FREE_THRESHOLD ? 0 : STANDARD_FEE;
  return delivery === "chronopost" ? base + EXPRESS_ADDON : base;
}

export function isValidDeliveryKey(key: string): key is DeliveryKey {
  return key === "mondial_relay" || key === "colissimo" || key === "chronopost";
}
