/**
 * Adds just the Amri 100-card pack (from src/lib/data/seed.ts) to Supabase,
 * without touching the rest of the catalogue — unlike `npm run db:seed`,
 * which would also push the demo products.
 *
 * Usage: npm run db:add-amri
 * Insert-only: if the product already exists nothing is overwritten. It's
 * created **inactive** — check price / stock in /admin, then tick "Actif".
 */
import { createClient } from "@supabase/supabase-js";
import { seedProducts } from "../src/lib/data/seed.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const p = seedProducts.find((x) => x.id === "prd_amri_100")!;

async function main() {
  // The collection list is edited from the admin, so the seed's may be gone.
  const { data: collection } = await supabase
    .from("collections")
    .select("slug")
    .eq("slug", p.collectionSlug ?? "")
    .maybeSingle();

  const { data, error } = await supabase
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
      },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw error;

  console.log(
    data?.length
      ? `Added "${p.slug}" (inactive). Set the price in /admin, then activate it.`
      : `"${p.slug}" already exists — left unchanged.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
