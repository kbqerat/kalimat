/**
 * Puts the Amri 100-card pack (src/lib/data/seed.ts + amri-cards.ts) in
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
import { AMRI_PRODUCT_ID, seedPackCards } from "../src/lib/data/amri-cards.ts";
import { seedProducts } from "../src/lib/data/seed.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const p = seedProducts.find((x) => x.id === AMRI_PRODUCT_ID)!;

async function main() {
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
      seedPackCards.map((c) => ({
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
