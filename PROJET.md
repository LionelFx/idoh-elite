# iDoh ELITE — Suivi de projet

> Sportswear premium e-commerce · Next.js 16 / TypeScript / Tailwind v4 / React 19

---

## Stack technique

| Outil | Version | Rôle |
|-------|---------|------|
| Next.js | 16.2.9 (App Router + Turbopack) | Framework principal |
| React | 19 | UI |
| TypeScript | 5 | Typage |
| Tailwind CSS | v4 (`@theme {}`) | Styles |
| Lucide React | — | Icônes |

**Polices :** Barlow Condensed (titres, `font-condensed`) + Inter (corps)  
**Tokens couleurs :** `#FF9D3D` orange · `#1a1a1a` dark · `#f5f5f5` gris · `#e0e0e0` bordure · `#999999` muted

---

## Pages

| Route | Fichier | État |
|-------|---------|------|
| `/` | `src/app/page.tsx` | ✅ Terminé |
| `/products` | `src/app/products/page.tsx` | ✅ Terminé |
| `/products/[id]` | `src/app/products/[id]/page.tsx` | ✅ Terminé |
| `/cart` | `src/app/cart/page.tsx` | ✅ Terminé |
| `/checkout` | `src/app/checkout/page.tsx` | ✅ Terminé |
| `/not-found` | `src/app/not-found.tsx` | ✅ Terminé |

---

## Fonctionnalités implémentées

### Core e-commerce
- [x] Catalogue avec filtres (catégorie, prix max) + tri (Nouveautés / Popularité / Prix)
- [x] Recherche fonctionnelle (barre header → `/products?q=...`)
- [x] Fiche produit complète (galerie, coloris, tailles, quantité, avis)
- [x] Panier (ajout, suppression, mise à jour quantité, total)
- [x] Checkout (Standard/Express, validation formulaire, confirmation)

### UX / Design
- [x] Header fixe avec rétrécissement au scroll (h-20 → h-14)
- [x] Animations scroll-triggered (IntersectionObserver via `useReveal`)
- [x] Parallaxe sur le hero (image fond à 25% de la vitesse de scroll)
- [x] Skeleton loading (catalogue pendant chargement Suspense)
- [x] Page 404 personnalisée (dark, "404" orange/blanc Barlow)
- [x] Toasts (notifications ajout panier/favoris, auto-dismiss 3s)
- [x] Wishlist avec persistance localStorage (`idoh-wishlist`)
- [x] Badge Bestseller (reviews ≥ 35) + badge stock urgent (stock ≤ 5)
- [x] Barre de stock sur fiche produit (orange/vert selon niveau)
- [x] Bouton wishlist ♥ sur fiche produit et cartes catalogue

### Catalogue
- [x] Tri "Nouveautés" groupé par catégorie (Maillots → Chaussures → T-shirts)
- [x] Titre dynamique (nom de catégorie / résultat de recherche)
- [x] Compteur de produits dans le header du catalogue
- [x] État vide personnalisé (avec ou sans recherche active)

### Mobile
- [x] Header responsive (menu burger, nav compacte)
- [x] Footer compact 3 colonnes sur mobile
- [x] Grille catalogue adaptative (1 col → 2 col → 3 col)

---

## Catégories produits

| ID | Nom | Slug | Produits actuels |
|----|-----|------|-----------------|
| 1 | Maillots | `maillot` | 3 (France Away, France Home, Haïti) |
| 2 | Chaussures | `chaussure` | 3 (Jordan KAWS, LV Trainer, NB610) |
| 3 | Survêtements | `survetement` | 0 — à remplir par le client |
| 4 | T-shirts | `tshirt` | 1 (Burberry Logo Tee) |
| 5 | Essentiels | `essentiel` | 0 — à remplir par le client (sous-vêtements, accessoires) |

### Ajouter un produit
Éditer `src/data/products.json` en suivant ce modèle :

```json
{
  "id": "8",
  "name": "Nom du produit",
  "description": "Description détaillée...",
  "price": 99.99,
  "category": "Survêtement",
  "category_id": "3",
  "images": ["/products/nom-image.webp"],
  "colors": ["#111111", "#FFFFFF"],
  "sizes": ["S", "M", "L", "XL"],
  "stock": 20,
  "rating": 4.5,
  "reviews_count": 10,
  "brand": "Nom de la marque",
  "created_at": "2026-06-13T10:00:00Z"
}
```

**Images :** déposer dans `public/products/` au format `.webp` recommandé.  
**Badge Bestseller** : automatique si `reviews_count ≥ 35`  
**Badge stock urgent** : automatique si `stock ≤ 5`

---

## Contextes globaux

| Contexte | Fichier | Fonctions exposées |
|---------|---------|-------------------|
| CartContext | `src/contexts/CartContext.tsx` | `addItem`, `removeItem`, `updateQty`, `clearCart`, `items`, `itemCount`, `total` |
| WishlistContext | `src/contexts/WishlistContext.tsx` | `toggle(id)`, `has(id)`, `ids` — persisté localStorage |
| ToastContext | `src/contexts/ToastContext.tsx` | `addToast(message, type?)` — auto-dismiss 3s |

---

## Tâches en attente / roadmap

### Priorité haute (à faire prochainement)
- [ ] Ajouter des produits dans les catégories Survêtements (cat_id: 3) et Essentiels (cat_id: 5)
- [ ] Page Wishlist (`/wishlist`) — afficher les produits sauvegardés
- [ ] Connexion à un vrai système de paiement (Stripe recommandé)

### Priorité moyenne
- [ ] Système d'authentification client (compte, historique commandes)
- [ ] Back-office simple pour gérer les produits sans toucher au JSON
- [ ] Avis clients réels (base de données)
- [ ] Emails de confirmation commande (Resend / SendGrid)

### Priorité basse / idées
- [ ] Page marques (ex: Nike, Adidas, Louis Vuitton)
- [ ] Comparateur de produits
- [ ] Programme fidélité / points
- [ ] Internationalisation (FR/EN)

---

## Déploiement

- **Dev local :** `npm run dev` → http://localhost:3000
- **Build prod :** `npm run build` (vérifié ✅ sans erreurs)
- **Vercel :** projet lié, déploiement possible via `vercel deploy`

---

*Dernière mise à jour : 13 juin 2026*
