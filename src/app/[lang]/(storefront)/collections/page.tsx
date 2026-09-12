import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionCard } from "@/components/product/collection-card";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCollections } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.collections.title };
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const collections = await getCollections();

  return (
    <section className="mx-auto max-w-6xl px-[var(--page-margin)] py-10">
      <header>
        <span className="text-xs font-bold uppercase tracking-widest text-brand">
          {dict.home.collectionsEyebrow}
        </span>
        <h1 className="mt-1 font-display text-3xl">{dict.collections.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{dict.collections.subtitle}</p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {collections.map((c) => (
          <CollectionCard key={c.slug} collection={c} locale={locale} dict={dict} />
        ))}
      </div>
    </section>
  );
}
