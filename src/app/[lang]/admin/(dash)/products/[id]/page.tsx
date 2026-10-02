import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImages } from "@/components/admin/product-images";
import { getCollections, getPackCards, getProductById } from "@/lib/data";
import type { Product } from "@/lib/data/types";

export const dynamic = "force-dynamic";

function blankProduct(): Product {
  return {
    id: `prd_${Date.now().toString(36)}`,
    slug: "",
    title: { fr: "", ar: "", en: "" },
    tagline: { fr: "", ar: "", en: "" },
    description: { fr: "", ar: "", en: "" },
    type: "cards",
    collectionSlug: null,
    priceMad: 89,
    stock: 0,
    rating: 5,
    ratingCount: 0,
    salesCount: 0,
    images: [],
    highlights: [],
    featured: false,
    isActive: false,
    audioEnabled: false,
  };
}

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const collections = await getCollections();

  if (id === "new") {
    return (
      <div className="space-y-10">
        <ProductForm lang={lang} product={blankProduct()} collections={collections} isNew />
        <p className="max-w-3xl rounded-xl border border-dashed border-line p-4 text-xs text-ink-soft">
          Enregistre le produit pour débloquer l’upload des photos.
        </p>
      </div>
    );
  }

  const product = await getProductById(id);
  if (!product) notFound();
  const cardCount = product.audioEnabled ? (await getPackCards(product.id)).length : 0;

  return (
    <div className="space-y-10">
      <ProductForm
        lang={lang}
        product={product}
        collections={collections}
        isNew={false}
      />
      {product.audioEnabled && (
        <section className="max-w-3xl rounded-xl border border-line p-4">
          <h2 className="font-display text-lg">Cartes audio</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {cardCount > 0
              ? `${cardCount} carte${cardCount > 1 ? "s" : ""} — mots, images et QR codes à imprimer.`
              : "Aucune carte pour l’instant : ajoute les mots, les images, puis télécharge les QR codes."}
          </p>
          <Link href={`/${lang}/admin/products/${product.id}/cards`} className="btn btn-brand mt-3">
            Gérer les cartes →
          </Link>
        </section>
      )}
      <ProductImages lang={lang} productId={product.id} images={product.images} />
    </div>
  );
}
