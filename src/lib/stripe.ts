import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Lazy init — comme getSupabase(), pour ne jamais instancier au chargement du module
// (sinon une clé manquante au build plante TOUTES les routes qui importent ce fichier).
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}
