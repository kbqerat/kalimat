import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { isLocale } from "@/i18n/config";
import { getProductBySlug } from "@/lib/data";
import { siteUrl } from "@/lib/site";

/**
 * Facebook / WhatsApp link preview for a product: its first photo fitted on a
 * 1200×630 JPEG (the product photos are WebP, which Facebook won't reliably
 * use), over a blurred copy of itself so there are no empty bars.
 */

const SIZE = { width: 1200, height: 630 };

export const revalidate = 60;

type Params = Promise<{ lang: string; slug: string }>;

export async function generateImageMetadata({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const product = await getProductBySlug(slug);
  const alt = product && isLocale(lang) ? product.title[lang] : "";
  return [{ id: "main", alt, size: SIZE, contentType: "image/jpeg" }];
}

/** Product photos are either absolute (Supabase Storage) or under /public. */
async function loadPhoto(src: string): Promise<Buffer> {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`og image: ${res.status} for ${src}`);
    return Buffer.from(await res.arrayBuffer());
  }
  try {
    return await readFile(path.join(process.cwd(), "public", src));
  } catch {
    // /public isn't always on the serverless function's disk; fetch it instead.
    const res = await fetch(new URL(src, siteUrl()));
    if (!res.ok) throw new Error(`og image: ${res.status} for ${src}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

export default async function Image({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const src = product?.images[0];

  let jpeg: Buffer;
  if (src) {
    const photo = await loadPhoto(src);
    const [background, foreground] = await Promise.all([
      sharp(photo).resize(SIZE.width, SIZE.height, { fit: "cover" }).blur(40).toBuffer(),
      sharp(photo).resize(SIZE.width, SIZE.height, { fit: "inside" }).toBuffer(),
    ]);
    jpeg = await sharp(background)
      .composite([{ input: foreground, gravity: "center" }])
      .jpeg({ quality: 85 })
      .toBuffer();
  } else {
    jpeg = await sharp({
      create: { ...SIZE, channels: 3, background: "#ffffff" },
    })
      .jpeg()
      .toBuffer();
  }

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  });
}
