import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { Stars } from "@/components/product/stars";
import type { CollectionWithCount } from "@/lib/data";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { localeHref } from "@/i18n/routing";
import type { Product } from "@/lib/data/types";
import { formatMad } from "@/lib/format";
import { PRODUCT_PLACEHOLDER } from "@/lib/product-visuals";

export function ProductCard({
  product,
  collections,
  locale,
  dict,
}: {
  product: Product;
  collections: CollectionWithCount[];
  locale: Locale;
  dict: Dictionary;
}) {
  const soldOut = product.stock <= 0;
  const low = !soldOut && product.stock <= 6;
  const save = product.compareAtMad
    ? product.compareAtMad - product.priceMad
    : 0;
  const href = localeHref(locale, `/products/${product.slug}`);
  const primaryCollection = collections.find((c) => c.slug === product.collectionSlug);
  const cover = product.images[0];
  const placeholder = PRODUCT_PLACEHOLDER[product.type];
  const cartItem = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: cover,
    priceMad: product.priceMad,
    stock: product.stock,
  };

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <Link href={href} className="relative block aspect-square bg-paper-deep">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.title[locale]}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={`grid h-full w-full place-items-center bg-linear-to-br text-5xl ${placeholder.from} ${placeholder.to}`}
          >
            <span className="opacity-70">{placeholder.icon}</span>
          </span>
        )}
        {soldOut ? (
          <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-bold text-white">
            {dict.product.outOfStock}
          </span>
        ) : (
          save > 0 && (
            <span className="badge-sale absolute start-3 top-3">
              −{formatMad(save, locale)}
            </span>
          )
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {primaryCollection && (
          <span className="tag w-fit">{primaryCollection.name[locale]}</span>
        )}

        <Link
          href={href}
          className="font-display text-[0.98rem] leading-snug hover:text-brand"
        >
          {product.title[locale]}
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-ink-soft">
          <Stars value={product.rating} />
          <span className="font-semibold text-ink">{product.rating.toFixed(2)}</span>
          <span>·</span>
          <span>+{t(dict.product.sold, { count: product.salesCount })}</span>
        </div>

        <div className="mt-1 flex items-end gap-2">
          <span className="text-lg font-extrabold text-riso-orange">
            {formatMad(product.priceMad, locale)}
          </span>
          {product.compareAtMad && (
            <span className="pb-0.5 text-sm text-ink-soft line-through">
              {formatMad(product.compareAtMad, locale)}
            </span>
          )}
        </div>

        {low && (
          <p className="text-xs font-semibold text-riso-orange">
            {t(dict.product.lowStock, { count: product.stock })}
          </p>
        )}

        <div className="mt-auto flex gap-1.5 pt-2">
          {!soldOut && (
            <BuyNowButton
              size="sm"
              label={dict.product.buyNowShort}
              checkoutHref={localeHref(locale, "/checkout")}
              item={cartItem}
              className="basis-[70%] !px-2"
            />
          )}
          <AddToCartButton
            size="sm"
            tone="ghost"
            icon={soldOut ? undefined : "always"}
            soldOut={soldOut}
            labelAdd={dict.product.addToCart}
            labelAdded={dict.product.added}
            labelOut={dict.product.outOfStock}
            item={cartItem}
            className={soldOut ? "" : "basis-[30%]"}
          />
        </div>
      </div>
    </div>
  );
}
