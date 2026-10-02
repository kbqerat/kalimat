/**
 * Puts the Amri audio packs — the 100-card pack (amri-cards.ts) and the
 * 96 photo cards (amri-photo-cards.ts), products in src/lib/data/seed.ts — in
 * Supabase without touching the rest of the catalogue — unlike
 * `npm run db:seed`, which would also push the demo products.
 *
 * Usage: npm run db:add-amri   (run the 2026-10-02 migration in schema.sql first)
 *
 * Never overwrites: a product or card that already exists is left as the
 * admin has it. A new product is created inactive; check price / stock in
 * /admin, then tick "Actif". Audio is switched on, since the printed QR
 * codes depend on it.
 */
import { createClient } from "@supabase/supabase-js";
import { AMRI_PRODUCT_ID, amriCards } from "../src/lib/data/amri-cards.ts";
import { AMRI_PHOTO_PRODUCT_ID, amriPhotoCards } from "../src/lib/data/amri-photo-cards.ts";
import { seedProducts } from "../src/lib/data/seed.ts";
import type { PackCard } from "../src/lib/data/types.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const packs: [string, PackCard[]][] = [
  [AMRI_PRODUCT_ID, amriCards],
  [AMRI_PHOTO_PRODUCT_ID, amriPhotoCards],
];

async function addPack(productId: string, seedCards: PackCard[]) {
  const p = seedProducts.find((x) => x.id === productId)!;
  // The collection list is edited from the admin, so the seed's may be gone.
  const { data: collection } = await supabase
    .from("collections")
    .select("slug")
    .eq("slug", p.collectionSlug ?? "")
    .maybeSingle();

  const { data: added, error } = await supabase
    .from("products")
    .upsert(
      {
        id: p.id,
        slug: p.slug,
        type: p.type,
        collection_slug: collection ? p.collectionSlug : null,
        price_mad: p.priceMad,
        compare_at_mad: p.compareAtMad ?? null,
        stock: p.stock,
        rating: p.rating,
        rating_count: p.ratingCount,
        sales_count: p.salesCount,
        card_count: p.cardCount ?? null,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        highlights: p.highlights,
        images: p.images,
        featured: p.featured,
        is_active: false,
        audio_enabled: true,
      },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw error;
  console.log(
    added?.length
      ? `Added "${p.slug}" (inactive). Set the price in /admin, then activate it.`
      : `"${p.slug}" already exists — product left unchanged.`,
  );

  const { error: audioError } = await supabase
    .from("products")
    .update({ audio_enabled: true })
    .eq("id", p.id);
  if (audioError) throw audioError;

  const { data: cards, error: cardError } = await supabase
    .from("pack_cards")
    .upsert(
      seedCards.map((c) => ({
        product_id: c.productId,
        n: c.n,
        word: c.word,
        sentence: c.sentence ?? null,
        image: c.image ?? null,
      })),
      { onConflict: "product_id,n", ignoreDuplicates: true },
    )
    .select("n");
  if (cardError) throw cardError;
  console.log(`Audio on. ${cards?.length ?? 0} new card(s) added, existing ones left as they are.`);
}

async function main() {
  for (const [productId, cards] of packs) await addPack(productId, cards);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
