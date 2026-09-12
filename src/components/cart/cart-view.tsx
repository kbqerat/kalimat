"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { MAX_QTY, useCart } from "@/components/cart/cart-context";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { localeHref } from "@/i18n/routing";
import { formatMad } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_MAD, shippingFor } from "@/lib/site";

export function CartView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { items, subtotalMad, count, setQty, remove, ready } = useCart();

  if (!ready) {
    return (
      <p className="py-20 text-center text-sm text-ink-soft">{dict.common.loading}</p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card p-14 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-2xl">
          🛒
        </span>
        <p className="mt-4 font-display text-xl">{dict.cart.empty}</p>
        <Link href={localeHref(locale, "/products")} className="btn btn-primary mt-6">
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotalMad);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-sm">
            🛍️
          </span>
          <h2 className="font-display text-sm">
            {count} {count === 1 ? dict.cart.item : dict.cart.items}
          </h2>
        </div>

        <ul className="divide-y divide-line">
          {items.map((it) => {
            const cap = Math.min(it.stock, MAX_QTY);
            const atMin = it.qty <= 1;
            const atMax = it.qty >= cap;
            return (
              <li key={it.productId} className="flex gap-4 p-4 transition-colors hover:bg-paper-deep/40">
                <Link
                  href={localeHref(locale, `/products/${it.slug}`)}
                  className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-paper-deep"
                >
                  {it.image ? (
                    <img src={it.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-linear-to-br from-brand/15 to-brand/5 text-2xl">
                      <span className="opacity-70">🗂️</span>
                    </span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={localeHref(locale, `/products/${it.slug}`)}
                    className="font-display text-sm leading-snug hover:text-brand"
                  >
                    {it.title[locale]}
                  </Link>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatMad(it.priceMad, locale)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        onClick={() => setQty(it.productId, it.qty - 1)}
                        disabled={atMin}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-paper-deep disabled:pointer-events-none disabled:opacity-30"
                        aria-label="-"
                      >
                        −
                      </button>
                      <span className="grid h-8 w-8 place-items-center text-sm font-semibold">
                        {it.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(it.productId, it.qty + 1)}
                        disabled={atMax}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-paper-deep disabled:pointer-events-none disabled:opacity-30"
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                    {atMax && (
                      <span className="text-xs font-semibold text-riso-orange">
                        {t(dict.cart.maxStock, { count: cap })}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(it.productId)}
                      className="text-xs text-ink-soft underline hover:text-riso-orange"
                    >
                      {dict.cart.remove}
                    </button>
                  </div>
                </div>

                <div className="shrink-0 self-center font-display">
                  {formatMad(it.priceMad * it.qty, locale)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="card h-fit p-5 lg:sticky lg:top-40">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-sm">
            🧾
          </span>
          <h2 className="font-display text-lg">{dict.checkout.summary}</h2>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">
              {dict.cart.subtotal} · {count}{" "}
              {count === 1 ? dict.cart.item : dict.cart.items}
            </dt>
            <dd>{formatMad(subtotalMad, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">{dict.cart.shipping}</dt>
            <dd>
              {shipping === 0 ? dict.cart.shippingFree : formatMad(shipping, locale)}
            </dd>
          </div>
          <p className="text-xs text-ink-soft">{dict.cart.shippingNote}</p>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-display">{dict.cart.total}</span>
          <span className="font-display text-xl">
            {formatMad(subtotalMad + shipping, locale)}
          </span>
        </div>

        <Link
          href={localeHref(locale, "/checkout")}
          className="btn btn-primary mt-5 w-full"
        >
          {dict.cart.checkout}
        </Link>
        <p className="mt-2 text-center text-xs text-ink-soft">
          {dict.cart.codBadge} · {FREE_SHIPPING_THRESHOLD_MAD}+ {dict.common.currency}{" "}
          {dict.cart.shippingFree}
        </p>

        <Link
          href={localeHref(locale, "/products")}
          className="mt-4 block text-center text-xs text-ink-soft underline hover:text-brand"
        >
          {dict.cart.continue}
        </Link>
      </aside>
    </div>
  );
}
