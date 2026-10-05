/**
 * Generates the listen pages' MP3s with Azure Speech (voices in
 * src/lib/audio.ts): every word and sentence of every audio pack's cards,
 * uploaded to the Supabase `uploads` bucket under `audio/`. Same job as the
 * "Générer les audios" button on a pack's cards page in /admin.
 *
 * Usage: npm run audio:generate
 * Needs AZURE_SPEECH_KEY / AZURE_SPEECH_REGION in .env.local.
 *
 * Only makes the clips that don't exist yet. Azure's free tier allows 20
 * requests a minute, so a full pack (~600 clips) takes about half an hour;
 * stopping and re-running picks up where it left off.
 */
import { createClient } from "@supabase/supabase-js";
import { amriCards } from "../src/lib/data/amri-cards.ts";
import { amriPhotoCards } from "../src/lib/data/amri-photo-cards.ts";
import type { PackCard } from "../src/lib/data/types.ts";
import {
  RateLimited,
  SPACING_MS,
  packClips,
  storeClip,
  storedClips,
  synthesize,
} from "../src/lib/audio.ts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loadCards(): Promise<PackCard[]> {
  if (!supabase) return [...amriCards, ...amriPhotoCards];
  const { data, error } = await supabase.from("pack_cards").select("word, sentence");
  if (error) throw error;
  return data as PackCard[];
}

async function main() {
  const cards = await loadCards();
  const clips = packClips(cards);
  const have = await storedClips(supabase);
  const todo = clips.filter((c) => !have.has(c.file));
  console.log(
    `${cards.length} cards, ${clips.length} clips, ${clips.length - todo.length} already made, ${todo.length} to generate` +
      (todo.length ? ` (~${Math.ceil((todo.length * SPACING_MS) / 60000)} min)` : ""),
  );

  for (const [i, { file, locale, text }] of todo.entries()) {
    const started = Date.now();
    for (;;) {
      try {
        await storeClip(supabase, file, await synthesize(locale, text));
        break;
      } catch (err) {
        if (!(err instanceof RateLimited)) throw err;
        console.log(`  Azure busy, retrying in ${err.retryAfter}s…`);
        await sleep(err.retryAfter * 1000);
      }
    }
    console.log(`[${i + 1}/${todo.length}] ${locale} ${text}`);
    await sleep(Math.max(0, SPACING_MS - (Date.now() - started)));
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
