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
import { getCollections, getProducts } from "@/lib/data";
import { paginate } from "@/lib/paginate";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.products.title };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ collection?: string; page?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  const { collection: active, page: rawPage } = await searchParams;
  const [allProducts, collections] = await Promise.all([
    getProducts(active ? { collection: active } : undefined),
    getCollections(),
  ]);
  const { items: products, page, totalPages } = paginate(
    allProducts,
    rawPage,
    PAGE_SIZE,
  );

  const chip = (slug?: string) =>
    localeHref(locale, `/products${slug ? `?collection=${slug}` : ""}`);
  const hrefFor = (p: number) => {
    const qs = new URLSearchParams();
    if (active) qs.set("collection", active);
    if (p > 1) qs.set("page", String(p));
    const query = qs.toString();
    return localeHref(locale, `/products${query ? `?${query}` : ""}`);
  };

  return (
    <section className="mx-auto max-w-6xl px-[var(--page-margin)] py-10">
      <header>
        <span className="text-xs font-bold uppercase tracking-widest text-brand">
          {dict.footer.shop}
        </span>
        <h1 className="mt-1 font-display text-3xl">{dict.products.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {t(dict.products.results, { count: allProducts.length })}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            {dict.products.filterTitle}
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link
                href={chip()}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2",
                  !active ? "bg-brand text-white" : "hover:bg-paper-deep",
                )}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-sm">
                  ✨
                </span>
                {dict.products.all}
              </Link>
            </li>
            {collections.map((c) => {
              const style = collectionStyle(c.slug);
              const isActive = active === c.slug;
              return (
                <li key={c.slug}>
                  <Link
                    href={chip(c.slug)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2",
                      isActive ? "bg-brand text-white" : "hover:bg-paper-deep",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-full text-sm",
                        isActive ? "bg-white/15" : style.tint,
                      )}
                    >
                      {style.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{c.name[locale]}</span>
                    <span
                      className={cn(
                        "text-xs",
                        isActive ? "text-white/80" : "text-ink-soft",
                      )}
                    >
                      {c.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <div>
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
                hrefFor={hrefFor}
                prevLabel={dict.pagination.prev}
                nextLabel={dict.pagination.next}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
