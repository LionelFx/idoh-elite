export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getDiscountedPrice(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export function getColorImage(product: { images: string[]; color_images?: Record<string, string> }, color: string): string {
  return product.color_images?.[color] || product.images[0];
}

interface VariantStockProduct {
  stock: number;
  stock_by_size?: Record<string, number>;
  stock_by_color?: Record<string, number>;
  stock_by_variant?: Record<string, Record<string, number>>;
}

// Stock dispo pour une combinaison taille+couleur précise. Si stock_by_variant est rempli
// (produit avec 2+ couleurs géré en grille), c'est la valeur exacte de la case qui compte —
// pas une approximation. Sinon, on retombe sur le minimum des deux pools indépendants
// (comportement historique, toujours valable pour les produits à 0 ou 1 couleur).
export function getVariantStock(product: VariantStockProduct, size: string, color: string): number {
  if (product.stock_by_variant && Object.keys(product.stock_by_variant).length > 0) {
    return product.stock_by_variant[size]?.[color] ?? 0;
  }
  const sizeStock = product.stock_by_size?.[size] ?? product.stock;
  const colorStock = product.stock_by_color?.[color] ?? product.stock;
  return Math.max(0, Math.min(sizeStock, colorStock));
}
