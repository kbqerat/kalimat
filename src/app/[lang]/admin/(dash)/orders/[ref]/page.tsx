import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { StatusSelect } from "@/components/admin/status-select";
import { getOrderByRef } from "@/lib/data";
import { formatMad } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ lang: string; ref: string }>;
}) {
  const { lang, ref } = await params;
  const order = await getOrderByRef(ref);
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href={`/${lang}/admin`}
        className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-riso-orange"
      >
        ← Toutes les commandes
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl uppercase tracking-tight">{order.ref}</h1>
        <div className="flex items-center gap-2">
          <StatusSelect refCode={order.ref} lang={lang} value={order.status} />
          <DeleteOrderButton refCode={order.ref} lang={lang} back />
        </div>
      </div>

      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-soft">
        {new Date(order.createdAt).toLocaleString("fr-MA")}
      </p>

      <section className="mt-6 border-2 border-ink p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          Livraison
        </h2>
        <p className="mt-2 text-sm">
          <strong>{order.customerName}</strong>
          <br />
          {order.phone}
          <br />
          {order.address}
          <br />
          {order.city}
        </p>
        {order.note && (
          <p className="mt-3 border-s-2 border-riso-orange ps-3 text-sm text-ink-soft">
            {order.note}
          </p>
        )}
      </section>

      <section className="mt-4 border-2 border-ink p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          Articles
        </h2>
        <ul className="mt-2 divide-y divide-line">
          {order.items.map((it) => (
            <li key={it.productId} className="flex justify-between py-2 text-sm">
              <span>
                {it.qty}× {it.productTitle}
              </span>
              <span className="font-mono">
                {formatMad(it.unitPriceMad * it.qty, "fr")}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 font-mono text-xs">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Sous-total</dt>
            <dd>{formatMad(order.subtotalMad, "fr")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Livraison</dt>
            <dd>{formatMad(order.shippingMad, "fr")}</dd>
          </div>
        </dl>
        <div className="mt-3 flex justify-between border-t-2 border-dashed border-ink pt-2">
          <span className="font-display uppercase">À encaisser</span>
          <span className="font-display text-2xl">{formatMad(order.totalMad, "fr")}</span>
        </div>
      </section>
    </div>
  );
}
