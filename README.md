# iDoh ELITE

Boutique en ligne de sportswear premium et streetwear de luxe — maillots officiels, sneakers et essentiels.

**Site en production :** [www.idohluxury.com](https://www.idohluxury.com)

---

## Stack technique

| Technologie | Rôle |
|-------------|------|
| Next.js 16.2.9 (App Router) | Framework full-stack |
| React 19 / TypeScript 5 | UI et typage |
| Tailwind CSS v4 | Styles (design system tokens) |
| Supabase | Base de données PostgreSQL + Auth |
| Stripe | Paiement en ligne (mode live) |
| Nodemailer | Emails transactionnels (Gmail SMTP) |
| OpenAI | Génération de contenu email et descriptions |
| Recharts | Graphiques dashboard admin |
| Vercel | Déploiement et hébergement |

---

## Fonctionnalités

- **Catalogue** — filtres par catégorie et prix, tri, recherche, pagination
- **Fiche produit** — galerie, coloris, tailles, compteur de stock, avis
- **Panier** — persistance session, mise à jour quantité
- **Paiement** — Stripe Checkout (invité ou compte, livraison Standard/Express)
- **Comptes clients** — inscription, connexion, historique des commandes, annulation
- **Checkout invité** — paiement sans compte, création de compte proposée après achat
- **Espace admin** — dashboard stats, gestion commandes/produits/codes promo/newsletter/messages
- **Emails automatiques** — confirmation commande, mise à jour statut, panier abandonné
- **Pages légales** — Mentions légales, CGV, Politique de retours
- **SEO** — sitemap, robots.txt, OpenGraph, métadonnées dynamiques

---

## Installation

```bash
git clone https://github.com/LionelFx/idoh-elite.git
cd idoh-elite
npm install
```

Copie `.env.example` en `.env.local` et renseigne les variables (voir ci-dessous).

```bash
npm run dev
```

Le site tourne sur [http://localhost:3000](http://localhost:3000).

---

## Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=

# Gmail (nodemailer)
GMAIL_USER=
GMAIL_APP_PASSWORD=

# Site
NEXT_PUBLIC_SITE_URL=https://www.idohluxury.com

# Cron
CRON_SECRET=
```

---

## Scripts

```bash
npm run dev      # Serveur de développement (Turbopack)
npm run build    # Build production
npm run start    # Serveur production local
npm run lint     # ESLint
```

---

## Structure

```
src/
  app/           # Pages (App Router) + API routes
  components/    # Composants UI réutilisables
  contexts/      # CartContext, WishlistContext, ToastContext, AuthContext
  lib/           # Supabase, Stripe, mailer, utilitaires
  types/         # Types TypeScript partagés
  data/          # Catégories (JSON statique)
public/
  products/      # Images produits (.webp)
  carriers/      # Logos transporteurs
```
