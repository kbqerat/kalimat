import Link from "next/link";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { StatusSelect } from "@/components/admin/status-select";
import { Pagination } from "@/components/site/pagination";
import { listOrders } from "@/lib/data";
import type { OrderStatus } from "@/lib/data/types";
import { formatMad } from "@/lib/format";
import { paginate } from "@/lib/paginate";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "cancelled", label: "Annulée" },
];

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { lang } = await params;
  const { page: rawPage, status: rawStatus } = await searchParams;
  const activeStatus = STATUS_FILTERS.some((f) => f.value === rawStatus)
    ? (rawStatus as OrderStatus)
    : undefined;

  const orders = await listOrders();
  const filtered = activeStatus ? orders.filter((o) => o.status === activeStatus) : orders;
  const { items: pageOrders, page, totalPages } = paginate(filtered, rawPage, PAGE_SIZE);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.totalMad, 0);

  const filterHref = (status?: OrderStatus) =>
    `/${lang}/admin${status ? `?status=${status}` : ""}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl uppercase tracking-tight">Commandes</h1>
        <div className="flex gap-3 font-mono text-[11px] uppercase tracking-widest">
          <span className="border-2 border-ink px-3 py-1">
            {orders.length} commandes
          </span>
          <span className="border-2 border-ink bg-riso-yellow px-3 py-1">
            {formatMad(revenue, "fr")}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 border-2 border-dashed border-ink/50 p-10 text-center font-mono text-xs uppercase tracking-widest text-ink-soft">
          Aucune commande pour l’instant.
          <br />
          Passe une commande de test depuis la boutique pour la voir apparaître ici.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={filterHref()}
              className={cn(
                "border-2 px-3 py-1 font-mono text-[11px] uppercase tracking-widest",
                !activeStatus
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/30 text-ink-soft hover:border-ink",
              )}
            >
              Toutes ({orders.length})
            </Link>
            {STATUS_FILTERS.map((f) => {
              const count = orders.filter((o) => o.status === f.value).length;
              const active = activeStatus === f.value;
              return (
                <Link
                  key={f.value}
                  href={filterHref(f.value)}
                  className={cn(
                    "border-2 px-3 py-1 font-mono text-[11px] uppercase tracking-widest",
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/30 text-ink-soft hover:border-ink",
                  )}
                >
                  {f.label} ({count})
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="mt-6 border-2 border-dashed border-ink/50 p-10 text-center font-mono text-xs uppercase tracking-widest text-ink-soft">
              Aucune commande avec ce statut.
            </p>
          )}
        </>
      )}

      {filtered.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y-2 border-ink text-start font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                <th className="p-2 text-start">Réf.</th>
                <th className="p-2 text-start">Date</th>
                <th className="p-2 text-start">Client</th>
                <th className="p-2 text-start">Ville</th>
                <th className="p-2 text-end">Total</th>
                <th className="p-2 text-start">Statut</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {pageOrders.map((o) => (
                <tr key={o.ref} className="border-b border-ink/30 align-middle">
                  <td className="p-2 font-mono">
                    <Link
                      href={`/${lang}/admin/orders/${o.ref}`}
                      className="underline hover:text-riso-orange"
                    >
                      {o.ref}
                    </Link>
                  </td>
                  <td className="p-2 font-mono text-xs text-ink-soft">
                    {new Date(o.createdAt).toLocaleDateString("fr-MA", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-2">
                    {o.customerName}
                    <br />
                    <span className="font-mono text-xs text-ink-soft">{o.phone}</span>
                  </td>
                  <td className="p-2">{o.city}</td>
                  <td className="p-2 text-end font-display">
                    {formatMad(o.totalMad, "fr")}
                  </td>
                  <td className="p-2">
                    <StatusSelect refCode={o.ref} lang={lang} value={o.status} />
                  </td>
                  <td className="p-2 text-end">
                    <DeleteOrderButton refCode={o.ref} lang={lang} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            hrefFor={(p) => {
              const qs = new URLSearchParams();
              if (activeStatus) qs.set("status", activeStatus);
              if (p > 1) qs.set("page", String(p));
              const query = qs.toString();
              return `/${lang}/admin${query ? `?${query}` : ""}`;
            }}
            prevLabel="Précédent"
            nextLabel="Suivant"
          />
        </div>
      )}
    </div>
  );
}
