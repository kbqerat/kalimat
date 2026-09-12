import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImages } from "@/components/admin/product-images";
import { getCollections, getProductById } from "@/lib/data";
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

  return (
    <div className="space-y-10">
      <ProductForm
        lang={lang}
        product={product}
        collections={collections}
        isNew={false}
      />
      <ProductImages lang={lang} productId={product.id} images={product.images} />
    </div>
  );
}
