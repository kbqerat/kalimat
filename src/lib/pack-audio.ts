import "server-only";

import { packClips, storedClips, type Clip } from "@/lib/audio";
import { getPackCards } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase";

/** Where clips live: the Supabase bucket, or `public/uploads/` without Supabase. */
export const audioStore = () => (process.env.NEXT_PUBLIC_SUPABASE_URL ? supabaseAdmin : null);

/** A pack's clips, and the ones not generated yet. */
export async function packAudioStatus(productId: string): Promise<{ total: number; missing: Clip[] }> {
  const [cards, have] = await Promise.all([getPackCards(productId), storedClips(audioStore())]);
  const clips = packClips(cards);
  return { total: clips.length, missing: clips.filter((c) => !have.has(c.file)) };
}
