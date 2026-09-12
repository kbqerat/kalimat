import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pagination } from "@/components/site/pagination";
import { ProductGrid } from "@/components/product/product-grid";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { localeHref } from "@/i18n/routing";
import { collectionStyle } from "@/lib/collection-visuals";
import { getCollectionBySlug, getCollections, getProducts } from "@/lib/data";
import { paginate } from "@/lib/paginate";

const PAGE_SIZE = 12;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return { title: collection.name[lang], description: collection.blurb[lang] };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  const { page: rawPage } = await searchParams;
  const [allProducts, collections] = await Promise.all([
    getProducts({ collection: slug }),
    getCollections(),
  ]);
  const { items: products, page, totalPages } = paginate(
    allProducts,
    rawPage,
    PAGE_SIZE,
  );
  const style = collectionStyle(slug);

  return (
    <section className="mx-auto max-w-6xl px-[var(--page-margin)] py-10">
      <Link
        href={localeHref(locale, "/collections")}
        className="text-sm text-ink-soft hover:text-brand"
      >
        ← {dict.collections.title}
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <span
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl ${style.tint}`}
        >
          {style.icon}
        </span>
        <div>
          <h1 className="font-display text-3xl">{collection.name[locale]}</h1>
          <p className="mt-1 max-w-prose text-sm text-ink-soft">
            {collection.blurb[locale]}
          </p>
          <p className="mt-2 text-xs font-semibold text-ink-soft">
            {t(dict.products.results, { count: allProducts.length })}
          </p>
        </div>
      </header>

      <div className="mt-8">
        {products.length === 0 ? (
          <p className="card p-10 text-center text-sm text-ink-soft">
            {dict.products.empty}
          </p>
        ) : (
          <>
            <ProductGrid
              products={products}
              collections={collections}
              locale={locale}
              dict={dict}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(p) =>
                localeHref(locale, `/collections/${slug}${p > 1 ? `?page=${p}` : ""}`)
              }
              prevLabel={dict.pagination.prev}
              nextLabel={dict.pagination.next}
            />
          </>
        )}
      </div>
    </section>
  );
}
