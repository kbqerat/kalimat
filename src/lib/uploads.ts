import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Image storage. With Supabase configured, files go to the public `uploads`
 * bucket (see the deploy guide — Vercel's filesystem is read-only, so this
 * is required in production). Without it, falls back to writing under
 * `public/uploads/<folder>/`, served straight from `/uploads/<folder>/...`,
 * which only works for local dev.
 */

export type UploadFolder = "products" | "collections" | "cards";

const USING_SUPABASE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const STORAGE_BUCKET = "uploads";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB per photo

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const ACCEPTED_TYPES = Object.keys(EXT_BY_TYPE);

export type UploadError = "type" | "size" | "empty";

export class InvalidUpload extends Error {
  constructor(readonly reason: UploadError) {
    super(reason);
    this.name = "InvalidUpload";
  }
}

/**
 * Checks the file's actual magic bytes against its claimed MIME type. The
 * browser-supplied `file.type` is just a request header an attacker fully
 * controls, so it's never enough on its own to trust a file as a real image.
 */
function matchesMagicBytes(bytes: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/webp":
      return (
        bytes.length >= 12 &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
      );
    case "image/avif":
      // ISOBMFF: 4-byte size, "ftyp", then a brand of "avif" or "avis".
      return (
        bytes.length >= 12 &&
        bytes.toString("ascii", 4, 8) === "ftyp" &&
        (bytes.toString("ascii", 8, 12) === "avif" || bytes.toString("ascii", 8, 12) === "avis")
      );
    default:
      return false;
  }
}

/** Persists one image file and returns its public URL. */
export async function saveUploadedImage(
  file: File,
  folder: UploadFolder,
): Promise<string> {
  if (file.size === 0) throw new InvalidUpload("empty");
  if (!ACCEPTED_TYPES.includes(file.type)) throw new InvalidUpload("type");
  if (file.size > MAX_UPLOAD_BYTES) throw new InvalidUpload("size");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesMagicBytes(bytes, file.type)) throw new InvalidUpload("type");

  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${EXT_BY_TYPE[file.type]}`;

  if (USING_SUPABASE) {
    const objectPath = `${folder}/${name}`;
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, bytes, { contentType: file.type });
    if (error) throw error;
    return supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
  }

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${folder}/${name}`;
}

/** Best-effort delete of a file previously returned by `saveUploadedImage`. */
export async function deleteUploadedImage(url: string): Promise<void> {
  if (USING_SUPABASE) {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const objectPath = url.slice(idx + marker.length);
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([objectPath]).catch(() => {
      // already gone — nothing to do
    });
    return;
  }

  const match = /^\/uploads\/([^/]+)\/([^/]+)$/.exec(url);
  if (!match) return;
  const [, folder, name] = match;
  await unlink(path.join(UPLOAD_ROOT, folder, name)).catch(() => {
    // already gone / never written — nothing to do
  });
}

export const saveProductImage = (file: File) => saveUploadedImage(file, "products");
export const saveCollectionImage = (file: File) => saveUploadedImage(file, "collections");
export const saveCardImage = (file: File) => saveUploadedImage(file, "cards");
