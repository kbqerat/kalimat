import Link from "next/link";
import { removeProduct } from "@/app/[lang]/admin/(dash)/actions";
import { Pagination } from "@/components/site/pagination";
import { getAllProductsForAdmin, getCollections } from "@/lib/data";
import { formatMad } from "@/lib/format";
import { paginate } from "@/lib/paginate";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang } = await params;
  const { page: rawPage } = await searchParams;
  const [allProducts, collections] = await Promise.all([
    getAllProductsForAdmin(),
    getCollections(),
  ]);
  const { items: products, page, totalPages } = paginate(
    allProducts,
    rawPage,
    PAGE_SIZE,
  );
  const collectionName = (slug: string | null) =>
    collections.find((c) => c.slug === slug)?.name.fr;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl">Produits</h1>
        <Link
          href={`/${lang}/admin/products/new`}
          className="btn btn-primary !py-2 !text-sm"
        >
          + Nouveau produit
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="p-2 text-start">Titre</th>
              <th className="p-2 text-start">Type</th>
              <th className="p-2 text-start">Collections</th>
              <th className="p-2 text-end">Prix</th>
              <th className="p-2 text-end">Stock</th>
              <th className="p-2 text-start">État</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="p-2">
                  <Link
                    href={`/${lang}/admin/products/${p.id}`}
                    className="font-medium hover:text-brand"
                  >
                    {p.title.fr}
                  </Link>
                  <br />
                  <span className="text-xs text-ink-soft">{p.slug}</span>
                </td>
                <td className="p-2">{p.type}</td>
                <td className="p-2 text-xs text-ink-soft">
                  {collectionName(p.collectionSlug) ?? "—"}
                </td>
                <td className="p-2 text-end">{formatMad(p.priceMad, "fr")}</td>
                <td className="p-2 text-end">
                  <span className={p.stock === 0 ? "text-riso-orange" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-2">
                  <span className="flex gap-1 text-[11px]">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        p.isActive
                          ? "bg-riso-teal/15 text-riso-teal"
                          : "bg-paper-deep text-ink-soft"
                      }`}
                    >
                      {p.isActive ? "actif" : "masqué"}
                    </span>
                    {p.featured && (
                      <span className="rounded-full bg-riso-yellow/20 px-2 py-0.5 text-[#8a5a00]">
                        vitrine
                      </span>
                    )}
                  </span>
                </td>
                <td className="p-2 text-end">
                  <form action={removeProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <button
                      className="text-xs text-ink-soft underline hover:text-riso-orange"
                      aria-label={`Supprimer ${p.title.fr}`}
                    >
                      Suppr.
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFor={(p) =>
          `/${lang}/admin/products${p > 1 ? `?page=${p}` : ""}`
        }
        prevLabel="Précédent"
        nextLabel="Suivant"
      />

      <p className="mt-4 text-xs text-ink-soft">
        Sans Supabase connecté, les modifications sont en mémoire et réinitialisées
        au redémarrage du serveur.
      </p>
    </div>
  );
}
