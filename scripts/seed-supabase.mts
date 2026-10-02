/**
 * One-time (or repeatable) seed: pushes the local mock catalogue
 * (src/lib/data/collections-seed.ts, seed.ts) into Supabase.
 *
 * Usage: npm run db:seed
 * Safe to re-run — it upserts by primary key (slug / id).
 */
import { createClient } from "@supabase/supabase-js";
import { seedCollections } from "../src/lib/data/collections-seed.ts";
import { seedPackCards } from "../src/lib/data/amri-cards.ts";
import { seedProducts } from "../src/lib/data/seed.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/seed-supabase.ts",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  console.log(`Seeding ${seedCollections.length} collections...`);
  const { error: colError } = await supabase.from("collections").upsert(
    seedCollections.map((c) => ({
      slug: c.slug,
      name: c.name,
      blurb: c.blurb,
      image: c.image ?? null,
      sort_order: c.order,
    })),
    { onConflict: "slug" },
  );
  if (colError) throw colError;
  console.log("Collections done.");

  console.log(`Seeding ${seedProducts.length} products...`);
  const { error: prodError } = await supabase.from("products").upsert(
    seedProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      type: p.type,
      collection_slug: p.collectionSlug,
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
      is_active: p.isActive,
      audio_enabled: p.audioEnabled,
    })),
    { onConflict: "id" },
  );
  if (prodError) throw prodError;
  console.log("Products done.");

  console.log(`Seeding ${seedPackCards.length} pack cards...`);
  const { error: cardError } = await supabase.from("pack_cards").upsert(
    seedPackCards.map((c) => ({
      product_id: c.productId,
      n: c.n,
      word: c.word,
      sentence: c.sentence ?? null,
      image: c.image ?? null,
    })),
    { onConflict: "product_id,n" },
  );
  if (cardError) throw cardError;
  console.log("Pack cards done.");

  console.log("✓ Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
