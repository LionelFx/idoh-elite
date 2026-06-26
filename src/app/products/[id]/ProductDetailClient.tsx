"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check, Package, RefreshCw, Shield, Heart } from "lucide-react";
import { fetchProduct, fetchProducts, fetchPurchaseCount } from "@/lib/products";
import ProductGallery from "@/components/product/ProductGallery";
import ColorPicker from "@/components/product/ColorPicker";
import SizePicker from "@/components/product/SizePicker";
import RatingStars from "@/components/product/RatingStars";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { useWishlist } from "@/contexts/WishlistContext";
import SizeGuide from "@/components/ui/SizeGuide";
import { formatPrice, getDiscountedPrice, getVariantStock } from "@/lib/utils";
import { Product } from "@/types";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const fakeReviews = [
  { name: "Thomas M.", rating: 5, comment: "Qualité exceptionnelle, je recommande à 100%. Le tissu est vraiment premium.", date: "Il y a 2 semaines" },
  { name: "Sarah L.", rating: 4, comment: "Très beau produit, conforme à la description. Livraison rapide.", date: "Il y a 1 mois" },
  { name: "Kevin R.", rating: 5, comment: "J'en ai commandé plusieurs ! Parfait, taille bien.", date: "Il y a 1 mois" },
];

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [purchaseCount, setPurchaseCount] = useState(0);

  useEffect(() => {
    fetchProduct(id).then(p => setProduct(p ?? null));
    fetchPurchaseCount(id).then(setPurchaseCount);
  }, [id]);

  if (product === undefined) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) { notFound(); return null; }
  return <ProductDetail product={product} purchaseCount={purchaseCount} />;
}

function ProductDetail({ product, purchaseCount }: { product: Product; purchaseCount: number }) {
  const { addItem, items: cartItems } = useCart();
  const { addToast } = useToast();
  const { toggle, has } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (addBtnRef.current) observer.observe(addBtnRef.current);
    return () => observer.disconnect();
  }, []);

  const isWished = has(product.id);

  const outOfStockColors = useMemo(() =>
    Object.entries(product.stock_by_color ?? {})
      .filter(([, qty]) => qty === 0)
      .map(([color]) => color),
  [product.stock_by_color]);

  const isDefaultColor = selectedColor === product.colors[0];

  // Photo dédiée à la couleur sélectionnée — un vrai remplacement isolé, jamais
  // atteignable par l'autoplay ou la navigation de la galerie (uniquement par ce clic).
  const colorOverrideImage = useMemo(() => {
    if (isDefaultColor || !selectedColor || !product.color_images) return undefined;
    return product.color_images[selectedColor] || undefined;
  }, [isDefaultColor, selectedColor, product.color_images]);

  const stockBySizeEntries = Object.entries(product.stock_by_size ?? {});
  const allSizes = stockBySizeEntries.length > 0
    ? Object.keys(product.stock_by_size)
    : product.sizes;
  const outOfStockSizes = stockBySizeEntries
    .filter(([, qty]) => qty === 0)
    .map(([size]) => size);

  const recentIds = useRecentlyViewed(product.id);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(all => {
      setSimilar(all.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4));
      if (recentIds.length > 0) {
        setRecentProducts(recentIds.map(rid => all.find(p => p.id === rid)).filter(Boolean) as Product[]);
      }
    });
  }, [product.category_id, product.id, recentIds]);

  const maxQty = getVariantStock(product, selectedSize, selectedColor);

  const alreadyInCart = cartItems
    .filter(i => i.product_id === product.id && i.size === selectedSize)
    .reduce((s, i) => s + i.quantity, 0);

  const remainingStock = Math.max(0, maxQty - alreadyInCart);

  useEffect(() => {
    setQty(1);
    setShowMaxWarning(false);
  }, [selectedSize]);

  const handleAddToCart = () => {
    if (!selectedSize || remainingStock === 0) return;
    const toAdd = Math.min(qty, remainingStock);
    for (let i = 0; i < toAdd; i++) {
      addItem(product, selectedColor, selectedSize);
    }
    setAdded(true);
    addToast(`${product.name} ajouté au panier !`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    toggle(product.id);
    addToast(isWished ? "Retiré des favoris" : "Ajouté aux favoris ♥", "info");
  };

  const finalPrice = getDiscountedPrice(product.price, product.discount_percent ?? 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: product.brand ?? "iDoh ELITE" },
    offers: {
      "@type": "Offer",
      price: finalPrice.toFixed(2),
      priceCurrency: "EUR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "iDoh ELITE" },
    },
    ...(product.reviews_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews_count,
        bestRating: 5,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-[#f5f5f5] pt-[100px] lg:pt-[116px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-[#999999]">
            <Link href="/" className="hover:text-[#FF9D3D] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#FF9D3D] transition-colors">Catalogue</Link>
            <span>/</span>
            <span className="text-[#1a1a1a] font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[#999999] hover:text-[#1a1a1a] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} overrideImage={colorOverrideImage} />

          <div>
            <div className="flex items-center justify-between mb-4">
              <Link href={`/products?cat=${product.category.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-widest text-[#FF9D3D] hover:text-[#FFB366] transition-colors">
                {product.category}
              </Link>
            </div>

            <h1 className="font-condensed font-black uppercase text-[#1a1a1a] mb-3"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", lineHeight: 1.1 }}>
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <RatingStars rating={product.rating} reviewsCount={product.reviews_count} size="md" />
            </div>

            <div className="mb-8">
              {product.discount_percent > 0 ? (
                <div className="flex flex-wrap items-end gap-3 mb-1">
                  <span className="font-condensed font-black text-red-500 text-5xl">
                    {formatPrice(finalPrice)}
                  </span>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[#999999] text-xl line-through">{formatPrice(product.price)}</span>
                    <span className="bg-red-500 text-white text-sm font-black px-2 py-0.5 rounded">-{product.discount_percent}%</span>
                  </div>
                </div>
              ) : (
                <span className="font-condensed font-black text-[#FF9D3D] text-5xl">{formatPrice(product.price)}</span>
              )}
              <span className="text-[#999999] text-sm">TTC · Livraison gratuite dès 70€</span>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#999999]">Disponibilité</span>
                <span className={
                  product.stock === 0 ? "text-red-500 font-bold" :
                  product.stock <= 5 ? "text-[#FF9D3D] font-bold" :
                  "text-green-600 font-semibold"
                }>
                  {product.stock === 0
                    ? "Rupture de stock"
                    : product.stock <= 5
                    ? `⚡ Plus que ${product.stock} exemplaire${product.stock > 1 ? "s" : ""} !`
                    : `En stock — ${product.stock} exemplaires`}
                </span>
              </div>
              <div className="h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: product.stock === 0 ? "0%" : `${Math.min((product.stock / 25) * 100, 100)}%`,
                    backgroundColor: product.stock === 0 ? "#ef4444" : product.stock <= 5 ? "#FF9D3D" : "#22c55e",
                  }}
                />
              </div>
            </div>

            {purchaseCount > 0 && (
              <p className="text-xs text-[#999999] mb-5">
                🔥 <span className="text-[#1a1a1a] font-semibold">{purchaseCount} personne{purchaseCount > 1 ? "s" : ""}</span> {purchaseCount > 1 ? "ont" : "a"} déjà acheté cette pièce
              </p>
            )}

            <p className="text-[#333333] text-sm leading-relaxed mb-8">{product.description}</p>

            <div className="mb-6">
              <ColorPicker colors={product.colors} selected={selectedColor} onChange={setSelectedColor} outOfStock={outOfStockColors} />
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">Taille</span>
                <SizeGuide category={product.category} />
              </div>
              <SizePicker sizes={allSizes} selected={selectedSize} onChange={setSelectedSize} outOfStock={outOfStockSizes} />
            </div>

            <div className="mb-8">
              <div className="flex gap-3">
                <div className={`flex items-center border-2 rounded overflow-hidden transition-colors duration-300 ${showMaxWarning ? "border-[#FF9D3D]" : "border-[#e0e0e0]"}`}>
                  <button onClick={() => { qty > 1 && setQty(qty - 1); setShowMaxWarning(false); }}
                    disabled={qty <= 1}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#f5f5f5] transition-colors text-lg font-bold disabled:opacity-30 cursor-pointer">
                    −
                  </button>
                  <span className="w-10 h-12 flex items-center justify-center text-sm font-bold border-x-2 border-[#e0e0e0]">{qty}</span>
                  <button onClick={() => {
                    if (qty < remainingStock) { setQty(qty + 1); setShowMaxWarning(false); }
                    else { setShowMaxWarning(true); setTimeout(() => setShowMaxWarning(false), 3000); }
                  }} className="w-12 h-12 flex items-center justify-center hover:bg-[#f5f5f5] transition-colors text-lg font-bold cursor-pointer">
                    +
                  </button>
                </div>

                <button ref={addBtnRef} onClick={handleAddToCart}
                  disabled={!selectedSize || remainingStock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    added ? "bg-green-500 text-white" : "bg-[#FF9D3D] text-white hover:bg-[#FFB366] active:scale-[0.98]"
                  }`}>
                  {added ? <><Check className="w-4 h-4" /> Ajouté au panier !</> : <><ShoppingBag className="w-4 h-4" /> Ajouter au panier</>}
                </button>

                <button onClick={handleWishlist}
                  className={`w-12 h-12 flex items-center justify-center rounded border-2 transition-all duration-200 cursor-pointer ${
                    isWished ? "border-[#FF9D3D] bg-[#FF9D3D] text-white" : "border-[#e0e0e0] text-[#999999] hover:border-[#FF9D3D] hover:text-[#FF9D3D]"
                  }`} aria-label="Ajouter aux favoris">
                  <Heart className={`w-5 h-5 ${isWished ? "fill-current" : ""}`} />
                </button>
              </div>

              <div className={`mt-3 overflow-hidden transition-all duration-300 ${showMaxWarning ? "max-h-16 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="flex items-center gap-2.5 bg-[#FF9D3D]/10 border border-[#FF9D3D]/30 rounded-lg px-4 py-2.5">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-xs font-bold text-[#FF9D3D]">
                      {remainingStock === 0
                        ? `Tu as déjà ${alreadyInCart} exemplaire${alreadyInCart > 1 ? "s" : ""} de taille ${selectedSize} dans ton panier — c'est le max dispo !`
                        : `Stock limité — il ne reste que ${remainingStock} exemplaire${remainingStock > 1 ? "s" : ""} de taille ${selectedSize}`}
                    </p>
                    <p className="text-[10px] text-[#FF9D3D]/70">Tu as atteint le maximum disponible pour cette taille.</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#999999] mb-6 text-center">✓ Commande maintenant — expédition sous 24h</p>

            <div className="grid grid-cols-3 gap-3 p-4 bg-[#f5f5f5] rounded-xl">
              {[
                { Icon: Package, label: "Livraison dès 70€" },
                { Icon: RefreshCw, label: "Retours 30j" },
                { Icon: Shield, label: "Paiement sécurisé" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon className="w-4 h-4 text-[#FF9D3D]" />
                  <span className="text-[10px] text-[#999999] font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 lg:mt-20 pt-10 border-t border-[#e0e0e0]">
          <h2 className="font-condensed font-black uppercase text-[#1a1a1a] mb-8 text-3xl">
            Avis clients ({product.reviews_count})
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {fakeReviews.map((review, i) => (
              <div key={i} className="bg-[#f5f5f5] rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-[#1a1a1a]">{review.name}</span>
                  <span className="text-xs text-[#999999]">{review.date}</span>
                </div>
                <RatingStars rating={review.rating} className="mb-3" />
                <p className="text-sm text-[#333333] leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-16 lg:mt-20 pt-10 border-t border-[#e0e0e0]">
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] mb-8 text-3xl">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p) => <ProductCard key={p.id} product={p} hideCategory />)}
            </div>
          </div>
        )}
      </div>

      {recentProducts.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-20 pt-10 border-t border-[#e0e0e0] pb-12">
          <h2 className="font-condensed font-black uppercase text-[#1a1a1a] mb-8 text-3xl">Récemment consultés</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e0e0e0] px-4 py-3 shadow-2xl transition-transform duration-300 ${showSticky ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1a1a1a] truncate">{product.name}</p>
            <p className="text-[#FF9D3D] font-black text-lg leading-tight">
              {formatPrice(finalPrice)}
              {product.discount_percent > 0 && (
                <span className="text-[#999999] text-xs font-semibold line-through ml-1.5">{formatPrice(product.price)}</span>
              )}
            </p>
          </div>
          <button onClick={handleAddToCart} disabled={!selectedSize || remainingStock === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 flex-shrink-0 ${
              added ? "bg-green-500 text-white" : "bg-[#FF9D3D] text-white active:scale-[0.97]"
            }`}>
            {added ? <><Check className="w-4 h-4" /> Ajouté !</> : <><ShoppingBag className="w-4 h-4" /> Ajouter</>}
          </button>
        </div>
      </div>
    </div>
  );
}
