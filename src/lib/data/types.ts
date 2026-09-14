import type { Locale } from "@/i18n/config";

export type Localized = Record<Locale, string>;

/** Product families the shop carries. */
export type ProductType =
  | "cards"
  | "box"
  | "poster"
  | "pack"
  | "activity"
  | "syllables";

export const PRODUCT_TYPES: ProductType[] = [
  "cards",
  "box",
  "poster",
  "pack",
  "activity",
  "syllables",
];

/** A store collection (category). Managed from the admin. */
export interface Collection {
  slug: string;
  name: Localized;
  blurb: Localized;
  /** Public image path, e.g. `/uploads/collections/xxx.jpg`. Optional. */
  image?: string;
  /** Sort order in nav / listing. Lower first. */
  order: number;
}

export interface Product {
  id: string;
  slug: string;
  title: Localized;
  tagline: Localized;
  description: Localized;
  type: ProductType;
  /** The collection this product belongs to, if any. */
  collectionSlug: string | null;
  priceMad: number;
  compareAtMad?: number;
  stock: number;
  /** 0–5, one decimal, e.g. 4.9. */
  rating: number;
  /** Number of ratings behind `rating`. */
  ratingCount: number;
  /** "+444 vendus" style social proof. */
  salesCount: number;
  /** Uploaded product photos. Public paths, e.g. `/uploads/products/xxx.jpg`. */
  images: string[];
  /** Selling points shown as a bulleted list on the product page. */
  highlights: Localized[];
  /** Card count — only meaningful for `type: "cards" | "pack"`. */
  cardCount?: number;
  featured: boolean;
  isActive: boolean;
}

/** Store-wide settings, editable from the admin. Singleton row in Supabase. */
export interface Settings {
  siteName: string;
  shippingFlatMad: number;
  freeShippingThresholdMad: number;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
}

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface OrderItem {
  productId: string;
  productTitle: string;
  slug: string;
  unitPriceMad: number;
  qty: number;
}

export interface Order {
  id: string;
  ref: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  note?: string;
  items: OrderItem[];
  subtotalMad: number;
  shippingMad: number;
  totalMad: number;
  createdAt: string;
}
