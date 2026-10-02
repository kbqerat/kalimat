/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductSwiper } from "@/components/product/product-swiper";
import { Stars } from "@/components/product/stars";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { localeHref } from "@/i18n/routing";
import { getCollectionBySlug, getCollections, getProductBySlug, getProducts } from "@/lib/data";
import { AMRI_PRODUCT_SLUG, amriArt } from "@/lib/data/amri-cards";
import { formatMad } from "@/lib/format";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.title[lang], description: product.tagline[lang] };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const soldOut = product.stock <= 0;
  const low = !soldOut && product.stock <= 6;
  const save = product.compareAtMad ? product.compareAtMad - product.priceMad : 0;

  const [sameCollection, allProducts, collections, collection] = await Promise.all([
    getProducts({ collection: product.collectionSlug ?? undefined }),
    getProducts(),
    getCollections(),
    product.collectionSlug ? getCollectionBySlug(product.collectionSlug) : null,
  ]);
  // Same-collection picks first (most relevant), then fill with the rest of
  // the catalogue so the "you may also like" rail always has enough to scroll.
  const sameCollectionOthers = sameCollection.filter((p) => p.id !== product.id);
  const rest = allProducts.filter(
    (p) => p.id !== product.id && !sameCollectionOthers.some((s) => s.id === p.id),
  );
  const related = [...sameCollectionOthers, ...rest].slice(0, 10);

  return (
    <article className="mx-auto max-w-6xl px-[var(--page-margin)] py-8">
      <Link
        href={localeHref(locale, "/products")}
        className="text-sm text-ink-soft hover:text-brand"
      >
        ← {dict.product.backToProducts}
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <ProductGallery
          images={product.images}
          alt={product.title[locale]}
          type={product.type}
          badge={save > 0 ? `−${formatMad(save, locale)}` : undefined}
        />

        <div>
          {collection && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={localeHref(locale, `/collections/${collection.slug}`)}
                className="tag"
              >
                {collection.name[locale]}
              </Link>
            </div>
          )}

          <h1 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
            {product.title[locale]}
          </h1>
          <p className="mt-2 text-ink-soft">{product.tagline[locale]}</p>

          <div className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
            <Stars value={product.rating} size={16} />
            <span className="font-semibold text-ink">{product.rating.toFixed(2)}</span>
            <span>·</span>
            <span>+{t(dict.product.sold, { count: product.salesCount })}</span>
            <span>·</span>
            <span>{t(dict.product.reviews, { count: product.ratingCount })}</span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-riso-orange">
              {formatMad(product.priceMad, locale)}
            </span>
            {product.compareAtMad && (
              <span className="pb-1 text-lg text-ink-soft line-through">
                {formatMad(product.compareAtMad, locale)}
              </span>
            )}
            {save > 0 && (
              <span className="badge-sale mb-1.5">
                {t(dict.product.save, { amount: formatMad(save, locale) })}
              </span>
            )}
          </div>

          {low && (
            <p className="mt-2 text-sm font-semibold text-riso-orange">
              {t(dict.product.lowStock, { count: product.stock })}
            </p>
          )}

          <div className="mt-5 max-w-sm">
            <AddToCartButton
              soldOut={soldOut}
              labelAdd={dict.product.addToCart}
              labelAdded={dict.product.added}
              labelOut={dict.product.outOfStock}
              item={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                image: product.images[0],
                priceMad: product.priceMad,
                stock: product.stock,
              }}
            />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              [dict.trust.shippingTitle, dict.trust.shippingSub, "🚚"],
              [dict.trust.codTitle, dict.trust.codSub, "🔒"],
              [dict.trust.reviewsTitle, dict.trust.reviewsSub, "⭐"],
            ].map(([title, sub, icon]) => (
              <div
                key={title}
                className="rounded-xl border border-line bg-paper p-3 text-center"
              >
                <div className="text-lg">{icon}</div>
                <div className="mt-1 text-xs font-bold">{title}</div>
                <div className="text-[11px] text-ink-soft">{sub}</div>
              </div>
            ))}
          </div>

          {product.highlights.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                {dict.product.highlights}
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-riso-teal">✓</span>
                    <span>{h[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {product.slug === AMRI_PRODUCT_SLUG && (
        <section className="mt-10 card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-riso-orange/10 text-lg">
              🔊
            </span>
            <h2 className="font-display text-xl">{dict.amri.includedTitle}</h2>
          </div>
          <p className="mt-4 max-w-prose text-[15px] leading-[1.9] text-ink-soft">
            {dict.amri.includedBody}
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {[1, 27, 45, 51, 61, 80, 90, 95].map((n) => (
              <img
                key={n}
                src={amriArt(n)}
                alt=""
                loading="lazy"
                className="aspect-square w-full rounded-xl border border-line object-cover"
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-lg">
            📖
          </span>
          <h2 className="font-display text-xl">{dict.product.descriptionTitle}</h2>
        </div>
        <p className="mt-4 max-w-prose whitespace-pre-line text-[15px] leading-[1.9] text-ink-soft">
          {product.description[locale]}
        </p>
        {product.cardCount != null && (
          <span className="tag mt-5">
            🗂️ {t(dict.product.cardCount, { count: product.cardCount })}
          </span>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl">{dict.product.relatedTitle}</h2>
          <div className="mt-5">
            <ProductSwiper
              products={related}
              collections={collections}
              locale={locale}
              dict={dict}
            />
          </div>
        </section>
      )}
    </article>
  );
}
