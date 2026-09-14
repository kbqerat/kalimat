import "server-only";

import { makeOrderRef } from "@/lib/order-ref";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  FREE_SHIPPING_THRESHOLD_MAD,
  SHIPPING_FLAT_MAD,
  SITE_NAME,
  WHATSAPP_NUMBER,
  shippingFor,
} from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase";
import { seedCollections } from "./collections-seed";
import { seedProducts } from "./seed";
import type { Collection, Order, OrderItem, OrderStatus, Product, Settings } from "./types";

export type { Collection, Order, OrderItem, OrderStatus, Product, Settings } from "./types";

/**
 * Data layer. Reads from the local seed unless `NEXT_PUBLIC_SUPABASE_URL` is
 * set, in which case every function below talks to Supabase instead (schema
 * in `src/db/schema.sql`). Keeping the mock branch means the app still runs
 * for anyone who clones the repo without a Supabase project configured.
 */
const USING_SUPABASE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

// In-memory order store for the mock backend. Not durable across server
// restarts / serverless invocations — good enough to demo the flow.
const mockOrders = new Map<string, Order>();

// In-memory settings for the mock backend, seeded from the site.ts defaults.
const mockSettings: Settings = {
  siteName: SITE_NAME,
  shippingFlatMad: SHIPPING_FLAT_MAD,
  freeShippingThresholdMad: FREE_SHIPPING_THRESHOLD_MAD,
  contactPhone: CONTACT_PHONE,
  contactEmail: CONTACT_EMAIL,
  whatsappNumber: WHATSAPP_NUMBER,
};

function clone<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v));
}

/* ------------------------------ row mapping ------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? { fr: "", ar: "", en: "" },
    description: row.description ?? { fr: "", ar: "", en: "" },
    type: row.type,
    collectionSlug: row.collection_slug,
    priceMad: row.price_mad,
    compareAtMad: row.compare_at_mad ?? undefined,
    stock: row.stock,
    rating: Number(row.rating),
    ratingCount: row.rating_count,
    salesCount: row.sales_count,
    images: row.images ?? [],
    highlights: row.highlights ?? [],
    cardCount: row.card_count ?? undefined,
    featured: row.featured,
    isActive: row.is_active,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCollection(row: any): Collection {
  return {
    slug: row.slug,
    name: row.name,
    blurb: row.blurb ?? { fr: "", ar: "", en: "" },
    image: row.image ?? undefined,
    order: row.sort_order,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    ref: row.ref,
    status: row.status,
    customerName: row.customer_name,
    phone: row.phone,
    city: row.city,
    address: row.address,
    note: row.note ?? undefined,
    items: (row.order_items ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (it: any): OrderItem => ({
        productId: it.product_id,
        productTitle: it.product_title,
        slug: it.slug,
        unitPriceMad: it.unit_price_mad,
        qty: it.qty,
      }),
    ),
    subtotalMad: row.subtotal_mad,
    shippingMad: row.shipping_mad,
    totalMad: row.total_mad,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSettings(row: any): Settings {
  return {
    siteName: row.site_name ?? SITE_NAME,
    shippingFlatMad: row.shipping_flat_mad,
    freeShippingThresholdMad: row.free_shipping_threshold,
    contactPhone: row.store_phone ?? CONTACT_PHONE,
    contactEmail: row.contact_email ?? CONTACT_EMAIL,
    whatsappNumber: row.whatsapp_number ?? WHATSAPP_NUMBER,
  };
}

/* ------------------------------- catalogue ------------------------------- */

export async function getProducts(options?: {
  collection?: string;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  if (USING_SUPABASE) {
    let query = supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (options?.collection) query = query.eq("collection_slug", options.collection);
    if (options?.featuredOnly) query = query.eq("featured", true);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(rowToProduct);
  }
  let products = seedProducts.filter((p) => p.isActive);
  if (options?.collection) {
    products = products.filter((p) => p.collectionSlug === options.collection);
  }
  if (options?.featuredOnly) products = products.filter((p) => p.featured);
  return clone(products);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data) : null;
  }
  const product = seedProducts.find((p) => p.slug === slug && p.isActive);
  return product ? clone(product) : null;
}

export interface CollectionWithCount extends Collection {
  count: number;
}

export async function getCollections(): Promise<CollectionWithCount[]> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("collections")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const products = await getProducts();
    return data.map((row) => {
      const collection = rowToCollection(row);
      return {
        ...collection,
        count: products.filter((p) => p.collectionSlug === collection.slug).length,
      };
    });
  }
  const products = await getProducts();
  return [...seedCollections]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      ...clone(c),
      count: products.filter((p) => p.collectionSlug === c.slug).length,
    }));
}

export async function getCollectionBySlug(
  slug: string,
): Promise<CollectionWithCount | null> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const products = await getProducts({ collection: slug });
    return { ...rowToCollection(data), count: products.length };
  }
  const collection = seedCollections.find((c) => c.slug === slug);
  if (!collection) return null;
  const products = await getProducts({ collection: slug });
  return { ...clone(collection), count: products.length };
}

export async function upsertCollection(collection: Collection): Promise<Collection> {
  if (USING_SUPABASE) {
    const { error } = await supabaseAdmin.from("collections").upsert(
      {
        slug: collection.slug,
        name: collection.name,
        blurb: collection.blurb,
        image: collection.image ?? null,
        sort_order: collection.order,
      },
      { onConflict: "slug" },
    );
    if (error) throw error;
    return collection;
  }
  const idx = seedCollections.findIndex((c) => c.slug === collection.slug);
  if (idx >= 0) seedCollections[idx] = collection;
  else seedCollections.push(collection);
  return clone(collection);
}

/** Refuses to delete a collection that still has products in it. */
export async function deleteCollection(slug: string): Promise<boolean> {
  if (USING_SUPABASE) {
    const { count, error: countError } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("collection_slug", slug);
    if (countError) throw countError;
    if (count && count > 0) return false;

    const { error } = await supabaseAdmin.from("collections").delete().eq("slug", slug);
    if (error) throw error;
    return true;
  }
  if (seedProducts.some((p) => p.collectionSlug === slug)) return false;
  const idx = seedCollections.findIndex((c) => c.slug === slug);
  if (idx < 0) return false;
  seedCollections.splice(idx, 1);
  return true;
}

/* --------------------------------- orders -------------------------------- */

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  note?: string;
  items: { productId: string; qty: number }[];
}

export type CreateOrderResult =
  | { ok: true; ref: string }
  | { ok: false; error: "empty" | "unavailable" | "stock" };

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (input.items.length === 0) return { ok: false, error: "empty" };
  const items = input.items.map((i) => ({ ...i, qty: Math.max(1, Math.min(i.qty, 10)) }));

  if (USING_SUPABASE) {
    // Pre-check so we can return a specific error code — `place_order` (see
    // src/db/schema.sql) re-checks the same things itself, inside the
    // transaction, as the atomic guard against a stock race.
    const ids = items.map((i) => i.productId);
    const { data: products, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, stock, is_active")
      .in("id", ids);
    if (fetchError) throw fetchError;

    for (const line of items) {
      const product = products.find((p) => p.id === line.productId);
      if (!product || !product.is_active) return { ok: false, error: "unavailable" };
      if (product.stock < line.qty) return { ok: false, error: "stock" };
    }

    const ref = makeOrderRef();
    const { error } = await supabaseAdmin.rpc("place_order", {
      p_ref: ref,
      p_customer_name: input.customerName,
      p_phone: input.phone,
      p_city: input.city,
      p_address: input.address,
      p_note: input.note ?? "",
      p_items: items.map((i) => ({ product_id: i.productId, qty: i.qty })),
    });
    if (error) {
      if (error.message.includes("out of stock")) return { ok: false, error: "stock" };
      return { ok: false, error: "unavailable" };
    }
    return { ok: true, ref };
  }

  const lineItems: OrderItem[] = [];
  for (const line of items) {
    const product = seedProducts.find((p) => p.id === line.productId && p.isActive);
    if (!product) return { ok: false, error: "unavailable" };
    if (product.stock < line.qty) return { ok: false, error: "stock" };
    lineItems.push({
      productId: product.id,
      productTitle: product.title.fr,
      slug: product.slug,
      unitPriceMad: product.priceMad,
      qty: line.qty,
    });
  }

  const subtotalMad = lineItems.reduce((s, i) => s + i.unitPriceMad * i.qty, 0);
  const shippingMad = shippingFor(
    subtotalMad,
    mockSettings.shippingFlatMad,
    mockSettings.freeShippingThresholdMad,
  );
  const ref = makeOrderRef();
  const order: Order = {
    id: `ord_${Date.now().toString(36)}`,
    ref,
    status: "pending",
    customerName: input.customerName,
    phone: input.phone,
    city: input.city,
    address: input.address,
    note: input.note,
    items: lineItems,
    subtotalMad,
    shippingMad,
    totalMad: subtotalMad + shippingMad,
    createdAt: new Date().toISOString(),
  };

  for (const line of lineItems) {
    const product = seedProducts.find((p) => p.id === line.productId);
    if (product) product.stock -= line.qty;
  }
  mockOrders.set(ref, order);

  return { ok: true, ref };
}

export async function getOrderByRef(ref: string): Promise<Order | null> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("ref", ref.toUpperCase())
      .maybeSingle();
    if (error) throw error;
    return data ? rowToOrder(data) : null;
  }
  const order = mockOrders.get(ref.toUpperCase());
  return order ? clone(order) : null;
}

export async function listOrders(): Promise<Order[]> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(rowToOrder);
  }
  return [...mockOrders.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(clone);
}

export async function setOrderStatus(ref: string, status: OrderStatus): Promise<boolean> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("ref", ref.toUpperCase())
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }
  const order = mockOrders.get(ref.toUpperCase());
  if (!order) return false;
  order.status = status;
  return true;
}

/* ---------------------------- admin: products --------------------------- */

export async function getAllProductsForAdmin(): Promise<Product[]> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(rowToProduct);
  }
  return seedProducts.map(clone);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data) : null;
  }
  const product = seedProducts.find((p) => p.id === id);
  return product ? clone(product) : null;
}

export async function upsertProduct(product: Product): Promise<Product> {
  if (USING_SUPABASE) {
    const { error } = await supabaseAdmin.from("products").upsert(
      {
        id: product.id,
        slug: product.slug,
        type: product.type,
        collection_slug: product.collectionSlug,
        price_mad: product.priceMad,
        compare_at_mad: product.compareAtMad ?? null,
        stock: product.stock,
        rating: product.rating,
        rating_count: product.ratingCount,
        sales_count: product.salesCount,
        card_count: product.cardCount ?? null,
        title: product.title,
        tagline: product.tagline,
        description: product.description,
        highlights: product.highlights,
        images: product.images,
        featured: product.featured,
        is_active: product.isActive,
      },
      { onConflict: "id" },
    );
    if (error) throw error;
    return product;
  }
  const idx = seedProducts.findIndex((p) => p.id === product.id);
  if (idx >= 0) seedProducts[idx] = product;
  else seedProducts.push(product);
  return clone(product);
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (USING_SUPABASE) {
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
  const idx = seedProducts.findIndex((p) => p.id === id);
  if (idx < 0) return false;
  seedProducts.splice(idx, 1);
  return true;
}

/** Appends uploaded photo URLs to a product. Returns the updated product, or null. */
export async function addProductImages(
  id: string,
  urls: string[],
): Promise<Product | null> {
  if (USING_SUPABASE) {
    const product = await getProductById(id);
    if (!product) return null;
    const images = [...product.images, ...urls];
    const { error } = await supabaseAdmin.from("products").update({ images }).eq("id", id);
    if (error) throw error;
    return { ...product, images };
  }
  const product = seedProducts.find((p) => p.id === id);
  if (!product) return null;
  product.images = [...product.images, ...urls];
  return clone(product);
}

/** Removes one photo URL from a product. Returns the updated product, or null. */
export async function removeProductImage(
  id: string,
  url: string,
): Promise<Product | null> {
  if (USING_SUPABASE) {
    const product = await getProductById(id);
    if (!product) return null;
    const images = product.images.filter((u) => u !== url);
    const { error } = await supabaseAdmin.from("products").update({ images }).eq("id", id);
    if (error) throw error;
    return { ...product, images };
  }
  const product = seedProducts.find((p) => p.id === id);
  if (!product) return null;
  product.images = product.images.filter((u) => u !== url);
  return clone(product);
}

/* -------------------------------- settings ------------------------------- */

export async function getSettings(): Promise<Settings> {
  if (USING_SUPABASE) {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToSettings(data) : { ...mockSettings };
  }
  return { ...mockSettings };
}

export async function updateSettings(settings: Settings): Promise<Settings> {
  if (USING_SUPABASE) {
    const { error } = await supabaseAdmin
      .from("settings")
      .update({
        site_name: settings.siteName,
        shipping_flat_mad: settings.shippingFlatMad,
        free_shipping_threshold: settings.freeShippingThresholdMad,
        store_phone: settings.contactPhone,
        contact_email: settings.contactEmail,
        whatsapp_number: settings.whatsappNumber,
      })
      .eq("id", 1);
    if (error) throw error;
    return settings;
  }
  Object.assign(mockSettings, settings);
  return { ...mockSettings };
}
