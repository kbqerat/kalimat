/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { removeCollection } from "@/app/[lang]/admin/(dash)/actions";
import { getCollections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const collections = await getCollections();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl">Collections</h1>
        <Link
          href={`/${lang}/admin/collections/new`}
          className="btn btn-primary !py-2 !text-sm"
        >
          + Nouvelle collection
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="p-2 text-start">Nom</th>
              <th className="p-2 text-start">Slug</th>
              <th className="p-2 text-end">Produits</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.slug} className="border-b border-line/70">
                <td className="p-2">
                  <Link
                    href={`/${lang}/admin/collections/${c.slug}`}
                    className="flex items-center gap-2 font-medium hover:text-brand"
                  >
                    {c.image ? (
                      <img
                        src={c.image}
                        alt=""
                        className="h-8 w-8 rounded-md object-cover"
                      />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-paper-deep text-sm">
                        📚
                      </span>
                    )}
                    {c.name.fr}
                  </Link>
                </td>
                <td className="p-2 text-xs text-ink-soft">{c.slug}</td>
                <td className="p-2 text-end">{c.count}</td>
                <td className="p-2 text-end">
                  <form action={removeCollection}>
                    <input type="hidden" name="slug" value={c.slug} />
                    <input type="hidden" name="lang" value={lang} />
                    <button
                      disabled={c.count > 0}
                      title={
                        c.count > 0
                          ? "Retire d'abord les produits de cette collection"
                          : undefined
                      }
                      className="text-xs text-ink-soft underline hover:text-riso-orange disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                      aria-label={`Supprimer ${c.name.fr}`}
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

      <p className="mt-4 text-xs text-ink-soft">
        Sans Supabase connecté, les modifications sont en mémoire et réinitialisées
        au redémarrage du serveur.
      </p>
    </div>
  );
}
