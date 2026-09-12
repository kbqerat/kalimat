import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/collection-form";
import { getCollectionBySlug } from "@/lib/data";
import type { Collection } from "@/lib/data/types";

export const dynamic = "force-dynamic";

function blankCollection(): Collection {
  return {
    slug: "",
    name: { fr: "", ar: "", en: "" },
    blurb: { fr: "", ar: "", en: "" },
    order: 0,
  };
}

export default async function AdminCollectionEditPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (slug === "new") {
    return <CollectionForm lang={lang} collection={blankCollection()} isNew />;
  }

  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  return <CollectionForm lang={lang} collection={collection} isNew={false} />;
}
