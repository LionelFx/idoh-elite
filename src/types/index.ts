export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  category_id: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  stock_by_size: Record<string, number>;
  stock_by_color: Record<string, number>;
  stock_by_variant: Record<string, Record<string, number>>;
  discount_percent: number;
  color_images: Record<string, string>;
  rating: number;
  reviews_count: number;
  brand?: string;
  is_featured: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  color: string;
  size: string;
  price: number;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "nouveau" | "repondu";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}
