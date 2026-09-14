"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { safeLocale } from "@/i18n/config";
import {
  addProductImages,
  deleteCollection,
  deleteProduct,
  getAllProductsForAdmin,
  getCollectionBySlug,
  getCollections,
  getProductById,
  removeProductImage,
  setOrderStatus,
  updateSettings,
  upsertCollection,
  upsertProduct,
} from "@/lib/data";
import { slugify, uniqueSlug } from "@/lib/format";
import { PRODUCT_TYPES, type Collection, type Localized, type Product } from "@/lib/data/types";
import {
  deleteUploadedImage,
  InvalidUpload,
  saveCollectionImage,
  saveProductImage,
} from "@/lib/uploads";
import type { OrderStatus } from "@/lib/data/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "cancelled"];

export async function updateOrderStatus(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const ref = String(formData.get("ref") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const lang = safeLocale(formData.get("lang"));
  if (!ref || !STATUSES.includes(status)) return;
  await setOrderStatus(ref, status);
  revalidatePath(`/${lang}/admin`);
  revalidatePath(`/${lang}/admin/orders/${ref}`);
}

/* ------------------------------ products ------------------------------- */

const productSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "slug : minuscules, chiffres et tirets")
    .default(""),
  collectionSlug: z.string().trim().default(""),
  type: z.enum(PRODUCT_TYPES as [string, ...string[]]),
  priceMad: z.coerce.number().int().min(0).max(100000),
  compareAtMad: z.coerce.number().int().min(0).max(100000).optional(),
  stock: z.coerce.number().int().min(0).max(100000),
  rating: z.coerce.number().min(0).max(5),
  ratingCount: z.coerce.number().int().min(0).max(1000000),
  salesCount: z.coerce.number().int().min(0).max(1000000),
  cardCount: z.coerce.number().int().min(0).max(100000).optional(),
  isActive: z.coerce.boolean(),
  featured: z.coerce.boolean(),
  title_fr: z.string().trim().min(1, "Le titre est obligatoire."),
  title_ar: z.string().trim().default(""),
  title_en: z.string().trim().default(""),
  tagline_fr: z.string().trim().default(""),
  tagline_ar: z.string().trim().default(""),
  tagline_en: z.string().trim().default(""),
  description_fr: z.string().trim().default(""),
  description_ar: z.string().trim().default(""),
  description_en: z.string().trim().default(""),
  highlights_fr: z.string().default(""),
  highlights_ar: z.string().default(""),
  highlights_en: z.string().default(""),
});

export interface ProductFormState {
  ok?: boolean;
  error?: string;
}

function zipHighlights(fr: string, ar: string, en: string): Localized[] {
  const split = (s: string) =>
    s
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  const lf = split(fr);
  const la = split(ar);
  const le = split(en);
  const n = Math.max(lf.length, la.length, le.length);
  const out: Localized[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ fr: lf[i] ?? "", ar: la[i] ?? "", en: le[i] ?? "" });
  }
  return out;
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdmin())) return { error: "Non autorisé." };

  const raw = Object.fromEntries(formData.entries());
  const lang = safeLocale(raw.lang);

  const parsed = productSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
    featured: raw.featured === "on" || raw.featured === "true",
    compareAtMad: raw.compareAtMad ? raw.compareAtMad : undefined,
    cardCount: raw.cardCount ? raw.cardCount : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  const existing = await getProductById(d.id);

  const collections = await getCollections();
  const collectionSlug = collections.some((c) => c.slug === d.collectionSlug)
    ? d.collectionSlug
    : null;

  const existingSlugs = (await getAllProductsForAdmin())
    .filter((p) => p.id !== d.id)
    .map((p) => p.slug);
  const slug = d.slug || uniqueSlug(slugify(d.title_fr), existingSlugs);

  const product: Product = {
    id: d.id,
    slug,
    type: d.type as Product["type"],
    collectionSlug,
    priceMad: d.priceMad,
    compareAtMad: d.compareAtMad || undefined,
    stock: d.stock,
    rating: Math.round(d.rating * 100) / 100,
    ratingCount: d.ratingCount,
    salesCount: d.salesCount,
    cardCount: d.cardCount || undefined,
    isActive: d.isActive,
    featured: d.featured,
    title: { fr: d.title_fr, ar: d.title_ar || d.title_fr, en: d.title_en || d.title_fr },
    tagline: { fr: d.tagline_fr, ar: d.tagline_ar, en: d.tagline_en },
    description: {
      fr: d.description_fr,
      ar: d.description_ar,
      en: d.description_en,
    },
    highlights: zipHighlights(d.highlights_fr, d.highlights_ar, d.highlights_en),
    images: existing?.images ?? [],
  };

  await upsertProduct(product);
  revalidatePath(`/${lang}/admin/products`);
  revalidatePath(`/${lang}/products/${product.slug}`);
  return { ok: true };
}

export async function removeProduct(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const lang = safeLocale(formData.get("lang"));
  if (id) await deleteProduct(id);
  revalidatePath(`/${lang}/admin/products`);
}

/* --------------------------- product photos --------------------------- */

const MAX_PHOTOS_PER_UPLOAD = 8;

export interface ProductImagesState {
  ok?: boolean;
  error?: string;
  added?: number;
}

export async function uploadProductImages(
  _prev: ProductImagesState,
  formData: FormData,
): Promise<ProductImagesState> {
  if (!(await isAdmin())) return { error: "Non autorisé." };

  const id = String(formData.get("id") ?? "");
  const lang = safeLocale(formData.get("lang"));

  const product = await getProductById(id);
  if (!product) return { error: "Enregistre le produit avant d’ajouter des photos." };

  const files = formData
    .getAll("images")
    .filter((v): v is File => v instanceof File && v.size > 0);

  if (files.length === 0) return { error: "Choisis au moins une image." };
  if (files.length > MAX_PHOTOS_PER_UPLOAD) {
    return { error: `Maximum ${MAX_PHOTOS_PER_UPLOAD} photos à la fois.` };
  }

  const urls: string[] = [];
  try {
    for (const file of files) {
      urls.push(await saveProductImage(file));
    }
  } catch (err) {
    await Promise.all(urls.map(deleteUploadedImage));
    if (err instanceof InvalidUpload) {
      const msg = {
        type: "Format accepté : JPG, PNG, WebP ou AVIF.",
        size: "Photo trop lourde (5 Mo maximum).",
        empty: "Fichier vide.",
      }[err.reason];
      return { error: msg };
    }
    return { error: "Échec de l’upload. Réessaie." };
  }

  await addProductImages(id, urls);
  revalidatePath(`/${lang}/admin/products/${id}`);
  revalidatePath(`/${lang}/products/${product.slug}`);
  return { ok: true, added: urls.length };
}

export async function removeProductImageAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "");
  const lang = safeLocale(formData.get("lang"));
  if (!id || !url) return;

  const product = await getProductById(id);
  if (!product?.images.includes(url)) return;

  await removeProductImage(id, url);
  await deleteUploadedImage(url);
  revalidatePath(`/${lang}/admin/products/${id}`);
  revalidatePath(`/${lang}/products/${product.slug}`);
}

/* ----------------------------- collections ------------------------------ */

const collectionSchema = z.object({
  slug: z.string().trim().default(""),
  name_fr: z.string().trim().min(1, "Le nom est obligatoire."),
  name_ar: z.string().trim().default(""),
  name_en: z.string().trim().default(""),
  blurb_fr: z.string().trim().default(""),
  blurb_ar: z.string().trim().default(""),
  blurb_en: z.string().trim().default(""),
  order: z.coerce.number().int().optional(),
  removeImage: z.coerce.boolean().default(false),
});

export interface CollectionFormState {
  ok?: boolean;
  error?: string;
}

export async function saveCollection(
  _prev: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  if (!(await isAdmin())) return { error: "Non autorisé." };

  const raw = Object.fromEntries(formData.entries());
  const lang = safeLocale(raw.lang);

  const parsed = collectionSchema.safeParse({
    ...raw,
    removeImage: raw.removeImage === "on" || raw.removeImage === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  const existing = d.slug ? await getCollectionBySlug(d.slug) : null;

  const existingSlugs = (await getCollections())
    .filter((c) => c.slug !== d.slug)
    .map((c) => c.slug);
  const slug = d.slug || uniqueSlug(slugify(d.name_fr), existingSlugs);

  let image = existing?.image;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      image = await saveCollectionImage(file);
    } catch (err) {
      if (err instanceof InvalidUpload) {
        const msg = {
          type: "Format accepté : JPG, PNG, WebP ou AVIF.",
          size: "Photo trop lourde (5 Mo maximum).",
          empty: "Fichier vide.",
        }[err.reason];
        return { error: msg };
      }
      return { error: "Échec de l’upload. Réessaie." };
    }
  } else if (d.removeImage) {
    image = undefined;
  }
  if (existing?.image && existing.image !== image) {
    await deleteUploadedImage(existing.image);
  }

  const order = d.order ?? existing?.order ?? (await getCollections()).length + 1;

  const collection: Collection = {
    slug,
    name: { fr: d.name_fr, ar: d.name_ar || d.name_fr, en: d.name_en || d.name_fr },
    blurb: { fr: d.blurb_fr, ar: d.blurb_ar, en: d.blurb_en },
    image,
    order,
  };

  await upsertCollection(collection);
  revalidatePath(`/${lang}/admin/collections`);
  revalidatePath(`/${lang}/collections`);
  revalidatePath(`/${lang}/collections/${slug}`);
  revalidatePath(`/${lang}`, "layout");
  return { ok: true };
}

export async function removeCollection(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const slug = String(formData.get("slug") ?? "");
  const lang = safeLocale(formData.get("lang"));
  if (slug) await deleteCollection(slug);
  revalidatePath(`/${lang}/admin/collections`);
  revalidatePath(`/${lang}`, "layout");
}

/* ------------------------------- settings -------------------------------- */

const settingsSchema = z.object({
  siteName: z.string().trim().min(1, "Le nom de la boutique est obligatoire."),
  shippingFlatMad: z.coerce.number().int().min(0).max(10000),
  freeShippingThresholdMad: z.coerce.number().int().min(0).max(1000000),
  contactPhone: z.string().trim().min(1, "Le téléphone est obligatoire."),
  contactEmail: z.string().trim().email("Email invalide."),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, "Numéro WhatsApp invalide — chiffres uniquement, avec l'indicatif pays (ex. 212600029060)."),
});

export interface SettingsFormState {
  ok?: boolean;
  error?: string;
}

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (!(await isAdmin())) return { error: "Non autorisé." };

  const raw = Object.fromEntries(formData.entries());
  const lang = safeLocale(raw.lang);

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await updateSettings(parsed.data);
  revalidatePath(`/${lang}`, "layout");
  revalidatePath(`/${lang}/admin`, "layout");
  return { ok: true };
}
