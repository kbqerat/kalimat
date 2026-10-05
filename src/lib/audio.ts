import { createHash } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale } from "@/i18n/config";
import type { Localized } from "@/lib/data/types";

/**
 * Pre-generated MP3s for the listen pages (Azure Speech neural voices), so
 * every phone plays the same voice — even one with no Arabic voice of its own.
 * The admin's "Générer les audios" button (or `npm run audio:generate`)
 * makes them; the player falls back to the device's voice for any clip that
 * doesn't exist yet.
 *
 * A clip is named by the hash of its voice, speed and text, so the page can
 * compute its URL without a lookup, and editing a word in /admin simply
 * points at a new clip (until it's generated, the device voice is used).
 */

export const VOICES: Record<Locale, { name: string; lang: string }> = {
  ar: { name: "ar-MA-JamalNeural", lang: "ar-MA" },
  fr: { name: "fr-FR-VivienneMultilingualNeural", lang: "fr-FR" },
  en: { name: "en-GB-SoniaNeural", lang: "en-GB" },
};

/** A touch slower than normal — the listeners are small children. */
export const RATE = "-10%";

/** Storage folder (Supabase `uploads` bucket, or `public/uploads/` locally). */
export const AUDIO_FOLDER = "audio";

export function audioFileName(locale: Locale, text: string): string {
  const { name } = VOICES[locale];
  const hash = createHash("sha256").update(`${name}|${RATE}|${text.trim()}`).digest("hex");
  return `${hash.slice(0, 24)}.mp3`;
}

/** Public URL the clip for `text` has (or will have, once generated). */
export function audioUrl(locale: Locale, text: string): string {
  const file = `${AUDIO_FOLDER}/${audioFileName(locale, text)}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/uploads/${file}`
    : `/uploads/${file}`;
}

// ——— Generation (server / scripts only) ———————————————————————————————

/** Azure's free tier allows 20 requests per 60 s: one clip every ~3 s. */
export const SPACING_MS = 3100;

export interface Clip {
  file: string;
  locale: Locale;
  text: string;
}

/** Every distinct clip the cards need: each word and sentence, per language. */
export function packClips(cards: { word: Localized; sentence?: Localized }[]): Clip[] {
  const clips = new Map<string, Clip>();
  const add = (l?: Localized) => {
    if (!l) return;
    for (const locale of Object.keys(VOICES) as Locale[]) {
      const text = l[locale]?.trim();
      if (text) clips.set(audioFileName(locale, text), { file: audioFileName(locale, text), locale, text });
    }
  };
  for (const c of cards) {
    add(c.word);
    add(c.sentence);
  }
  return [...clips.values()];
}

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads", AUDIO_FOLDER);

/** Names of the clips already stored. `null` client = local `public/uploads/`. */
export async function storedClips(supabase: SupabaseClient | null): Promise<Set<string>> {
  if (!supabase) {
    await mkdir(LOCAL_DIR, { recursive: true });
    return new Set(await readdir(LOCAL_DIR));
  }
  const names = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage
      .from("uploads")
      .list(AUDIO_FOLDER, { limit: 1000, offset });
    if (error) throw error;
    for (const f of data) names.add(f.name);
    if (data.length < 1000) return names;
  }
}

/** Azure answered 429 (rate limit): wait `retryAfter` seconds and try again. */
export class RateLimited extends Error {
  // No constructor parameter property: Node's type stripping (scripts) rejects it.
  readonly retryAfter: number;
  constructor(retryAfter: number) {
    super(`Azure rate limit, retry in ${retryAfter}s`);
    this.name = "RateLimited";
    this.retryAfter = retryAfter;
  }
}

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => `&${{ "<": "lt", ">": "gt", "&": "amp", "'": "apos", '"': "quot" }[c]};`);

/** Makes one clip with Azure Speech (AZURE_SPEECH_KEY / AZURE_SPEECH_REGION). */
export async function synthesize(locale: Locale, text: string): Promise<Buffer> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) throw new Error("Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION.");
  const { name, lang } = VOICES[locale];
  const ssml =
    `<speak version="1.0" xml:lang="${lang}"><voice name="${name}"><lang xml:lang="${lang}">` +
    `<prosody rate="${RATE}">${escapeXml(text.trim())}</prosody></lang></voice></speak>`;
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      "User-Agent": "kalimat-audio",
    },
    body: ssml,
  });
  if (res.ok) return Buffer.from(await res.arrayBuffer());
  if (res.status === 429 || res.status >= 500)
    throw new RateLimited(Number(res.headers.get("retry-after")) || 15);
  throw new Error(`Azure ${res.status}: ${await res.text()}`);
}

export async function storeClip(supabase: SupabaseClient | null, file: string, mp3: Buffer) {
  if (!supabase) {
    await mkdir(LOCAL_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_DIR, file), mp3);
    return;
  }
  const { error } = await supabase.storage.from("uploads").upload(`${AUDIO_FOLDER}/${file}`, mp3, {
    contentType: "audio/mpeg",
    // The name is a hash of the content, so it never changes.
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;
}
