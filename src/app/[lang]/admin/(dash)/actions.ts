"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { locales, safeLocale } from "@/i18n/config";
import {
  addProductImages,
  deleteCollection,
  deleteOrder,
  deletePackCard,
  deleteProduct,
  getAllProductsForAdmin,
  getCollectionBySlug,
  getCollections,
  getPackCards,
  getProductById,
  removeProductImage,
  setOrderStatus,
  setPackCardImage,
  updateSettings,
  upsertCollection,
  upsertPackCardWords,
  upsertProduct,
} from "@/lib/data";
import { slugify, uniqueSlug } from "@/lib/format";
import { PRODUCT_TYPES, type Collection, type Localized, type Product } from "@/lib/data/types";
import {
  deleteUploadedImage,
  InvalidUpload,
  saveCardImage,
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

export async function deleteOrderAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const ref = String(formData.get("ref") ?? "");
  const lang = safeLocale(formData.get("lang"));
  if (!ref) return;
  await deleteOrder(ref);
  revalidatePath(`/${lang}/admin`);
  // Stock went back up: refresh the shop pages too.
  for (const l of locales) revalidatePath(`/${l}`, "layout");
  if (formData.get("back")) redirect(`/${lang}/admin`);
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
  audioEnabled: z.coerce.boolean(),
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
    audioEnabled: raw.audioEnabled === "on" || raw.audioEnabled === "true",
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

  // The slug is in every printed QR code (/ecoute/<slug>/<n>): once a pack
  // has cards, changing it would break the cards already sold.
  if (existing && slug !== existing.slug && (await getPackCards(existing.id)).length > 0) {
    return {
      error: `Ce pack a des cartes audio : son slug « ${existing.slug} » est imprimé dans les QR codes et ne peut plus changer.`,
    };
  }

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
    audioEnabled: d.audioEnabled,
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
  revalidateListenPages(product.slug);
  return { ok: true };
}

export async function removeProduct(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const lang = safeLocale(formData.get("lang"));
  if (id) {
    // Card rows go with the product (on delete cascade); their images don't.
    const cardImages = (await getPackCards(id)).flatMap((c) => (c.image ? [c.image] : []));
    await deleteProduct(id);
    await Promise.all(cardImages.map(deleteUploadedImage));
  }
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

/* ---------------------------- audio pack cards --------------------------- */

/** Listen pages are cached per locale; bust them all after a card edit. */
function revalidateListenPages(slug: string) {
  for (const l of locales) {
    revalidatePath(`/${l}/ecoute/${slug}`, "layout");
    revalidatePath(`/${l}/products/${slug}`);
  }
}

const UPLOAD_ERRORS = {
  type: "Format accepté : JPG, PNG, WebP ou AVIF.",
  size: "Image trop lourde (5 Mo maximum).",
  empty: "Fichier vide.",
} as const;

const MAX_CARD_NUMBER = 1000;

export interface PackCardsImportState {
  ok?: boolean;
  error?: string;
  count?: number;
}

/**
 * Bulk-creates / updates cards from pasted rows, one card per line:
 * `numéro ; arabe ; français ; anglais [; phrase ar ; phrase fr ; phrase en]`.
 * Cells may be separated by tabs (pasted from Excel), `;` or `|`. Without a
 * leading number, a line takes the number after the previous one.
 */
export async function importPackCards(
  _prev: PackCardsImportState,
  formData: FormData,
): Promise<PackCardsImportState> {
  if (!(await isAdmin())) return { error: "Non autorisé." };
  const id = String(formData.get("id") ?? "");
  const lang = safeLocale(formData.get("lang"));
  const product = await getProductById(id);
  if (!product) return { error: "Produit introuvable." };

  const lines = String(formData.get("rows") ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (lines.length === 0) return { error: "Colle au moins une ligne." };
  if (lines.length > MAX_CARD_NUMBER)
    return { error: `Maximum ${MAX_CARD_NUMBER} lignes.` };

  const cards: { n: number; word: Localized; sentence?: Localized }[] = [];
  let lastN = 0;
  for (const [i, line] of lines.entries()) {
    const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : "|";
    let cells = line.split(sep).map((c) => c.trim());
    const numbered = /^\d+$/.test(cells[0]);
    // A header row ("numéro ; arabe ; …") at the top is skipped.
    if (i === 0 && !numbered && /^(n°?|num|numéro|no|رقم)/i.test(cells[0]))
      continue;
    const n = numbered ? Number(cells[0]) : lastN + 1;
    if (numbered) cells = cells.slice(1);
    if (n < 1 || n > MAX_CARD_NUMBER)
      return { error: `Ligne ${i + 1} : numéro invalide.` };
    const [ar, fr, en, sAr, sFr, sEn] = cells;
    if (!ar || !fr || !en) {
      return {
        error: `Ligne ${i + 1} : il faut le mot en arabe, en français et en anglais.`,
      };
    }
    if (cards.some((c) => c.n === n))
      return { error: `Ligne ${i + 1} : la carte ${n} est en double.` };
    const sentence =
      sAr || sFr || sEn
        ? { ar: sAr ?? "", fr: sFr ?? "", en: sEn ?? "" }
        : undefined;
    cards.push({ n, word: { ar, fr, en }, sentence });
    lastN = n;
  }

  await upsertPackCardWords(id, cards);
  revalidatePath(`/${lang}/admin/products/${id}/cards`);
  revalidateListenPages(product.slug);
  return { ok: true, count: cards.length };
}

export interface PackCardImagesResult {
  /** Card numbers that got a new image. */
  matched: number[];
  /** File names that matched no card. */
  skipped: string[];
  error?: string;
}

/**
 * Attaches images to cards by file name: `12.png`, `012.webp` or
 * `carte-12.jpg` all go to card 12. Called in small batches by the admin
 * uploader to stay under the Server Action body size limit.
 */
export async function uploadPackCardImages(
  formData: FormData,
): Promise<PackCardImagesResult> {
  if (!(await isAdmin()))
    return { matched: [], skipped: [], error: "Non autorisé." };
  const id = String(formData.get("id") ?? "");
  const product = await getProductById(id);
  if (!product)
    return { matched: [], skipped: [], error: "Produit introuvable." };

  const known = new Set((await getPackCards(id)).map((c) => c.n));
  const files = formData
    .getAll("images")
    .filter((v): v is File => v instanceof File && v.size > 0);
  const result: PackCardImagesResult = { matched: [], skipped: [] };

  for (const file of files) {
    const n = Number(/\d+/.exec(file.name.replace(/\.[^.]+$/, ""))?.[0]);
    if (!known.has(n)) {
      result.skipped.push(file.name);
      continue;
    }
    try {
      const url = await saveCardImage(file);
      const previous = await setPackCardImage(id, n, url);
      if (previous) await deleteUploadedImage(previous);
      result.matched.push(n);
    } catch (err) {
      result.error =
        err instanceof InvalidUpload
          ? `${file.name} : ${UPLOAD_ERRORS[err.reason]}`
          : `${file.name} : échec de l’upload.`;
      break;
    }
  }

  revalidateListenPages(product.slug);
  return result;
}

/** Edits one card's words and sentence, and optionally replaces its image. */
export async function savePackCard(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const n = Number(formData.get("n"));
  const lang = safeLocale(formData.get("lang"));
  const product = await getProductById(id);
  if (!product || !Number.isInteger(n)) return;

  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const word = { ar: field("ar"), fr: field("fr"), en: field("en") };
  if (!word.ar && !word.fr && !word.en) return;
  const sentence = { ar: field("s_ar"), fr: field("s_fr"), en: field("s_en") };
  await upsertPackCardWords(id, [
    {
      n,
      word,
      sentence:
        sentence.ar || sentence.fr || sentence.en ? sentence : undefined,
    },
  ]);

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      const url = await saveCardImage(file);
      const previous = await setPackCardImage(id, n, url);
      if (previous) await deleteUploadedImage(previous);
    } catch (err) {
      if (!(err instanceof InvalidUpload)) throw err;
      // A bad file just leaves the old image — the words are saved.
    }
  }

  revalidatePath(`/${lang}/admin/products/${id}/cards`);
  revalidateListenPages(product.slug);
}

export async function removePackCard(formData: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const n = Number(formData.get("n"));
  const lang = safeLocale(formData.get("lang"));
  const product = await getProductById(id);
  if (!product || !Number.isInteger(n)) return;

  const image = await deletePackCard(id, n);
  if (image) await deleteUploadedImage(image);
  revalidatePath(`/${lang}/admin/products/${id}/cards`);
  revalidateListenPages(product.slug);
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
