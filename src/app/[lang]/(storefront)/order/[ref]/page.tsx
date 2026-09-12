import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { localeHref } from "@/i18n/routing";
import { formatMad } from "@/lib/format";
import { getOrderByRef } from "@/lib/data";
import type { OrderStatus } from "@/lib/data/types";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Order refs carry PII (name, phone, address) — throttle lookups per IP so
// the ~4.3e10-combination ref space can't be brute-forced from one device.
const LOOKUP_LIMIT = 20;
const LOOKUP_WINDOW_MS = 10 * 60 * 1000;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false },
};

const STATUS_KEY = {
  pending: "statusPending",
  confirmed: "statusConfirmed",
  cancelled: "statusCancelled",
} as const satisfies Record<OrderStatus, string>;

export default async function OrderPage({
  params,
}: {
  params: Promise<{ lang: string; ref: string }>;
}) {
  const { lang, ref } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  const ip = await clientIp();
  const allowed = rateLimit(`order-lookup:${ip}`, LOOKUP_LIMIT, LOOKUP_WINDOW_MS);
  const order = allowed ? await getOrderByRef(ref) : null;

  return (
    <section className="mx-auto max-w-2xl px-[var(--page-margin)] py-14">
      <div className="card p-6 sm:p-10">
        <p className="text-xs uppercase tracking-wide text-ink-soft">
          {dict.order.reference}
        </p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl">
          {!allowed
            ? dict.order.rateLimitedTitle
            : order
              ? dict.order.confirmedTitle
              : dict.order.notFoundTitle}
        </h1>

        <p className="mt-4 inline-block rounded-lg bg-paper-deep px-4 py-2 font-display text-xl tracking-widest text-brand">
          {ref.toUpperCase()}
        </p>

        {!allowed ? (
          <p className="mt-5 text-sm text-ink-soft">{dict.order.rateLimitedBody}</p>
        ) : order ? (
          <>
            <p className="mt-5 text-sm text-ink-soft">
              {t(dict.order.confirmedBody, { phone: order.phone })}
            </p>

            <dl className="mt-6 border-t border-line pt-4 text-sm">
              <div className="flex justify-between py-1.5">
                <dt className="text-ink-soft">{dict.order.status}</dt>
                <dd className="font-semibold text-riso-orange">
                  {dict.order[STATUS_KEY[order.status]]}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <dt className="text-ink-soft">{dict.order.deliverTo}</dt>
                <dd className="max-w-[60%] text-end">
                  {order.customerName} · {order.city}
                  <br />
                  {order.address}
                </dd>
              </div>
            </dl>

            <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
              {order.items.map((it) => (
                <li key={it.productId} className="flex justify-between py-2">
                  <span>
                    {it.qty}× {it.productTitle}
                  </span>
                  <span>{formatMad(it.unitPriceMad * it.qty, locale)}</span>
                </li>
              ))}
              <li className="flex justify-between py-2 text-ink-soft">
                <span>{dict.cart.shipping}</span>
                <span>
                  {order.shippingMad === 0
                    ? dict.cart.shippingFree
                    : formatMad(order.shippingMad, locale)}
                </span>
              </li>
            </ul>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-display">{dict.order.payOnDelivery}</span>
              <span className="font-display text-2xl">
                {formatMad(order.totalMad, locale)}
              </span>
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-ink-soft">{dict.order.notFoundBody}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {!order && (
            <Link href={localeHref(locale, "/order")} className="btn btn-primary">
              {dict.order.tryAgain}
            </Link>
          )}
          <Link href={localeHref(locale, "/")} className="btn btn-ghost">
            {dict.order.backHome}
          </Link>
        </div>
      </div>
    </section>
  );
}
