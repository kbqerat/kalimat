/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { savePackCard } from "@/app/[lang]/admin/(dash)/actions";
import {
  DeletePackCardButton,
  PackCardImagesUpload,
  PackCardsImport,
} from "@/components/admin/pack-cards";
import { getPackCards, getProductById } from "@/lib/data";
import type { PackCard } from "@/lib/data/types";
import { listenUrl, requestOrigin } from "@/lib/pack-qr";

export const dynamic = "force-dynamic";

/** An audio pack's cards: words, images and the QR codes to print. */
export default async function AdminPackCardsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const [cards, origin] = await Promise.all([getPackCards(id), requestOrigin()]);
  const missingImages = cards.filter((c) => !c.image).length;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl">Cartes audio · {product.title.fr}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {cards.length} carte{cards.length > 1 ? "s" : ""}
            {missingImages > 0 && ` · ${missingImages} sans image`}
          </p>
        </div>
        <Link
          href={`/${lang}/admin/products/${id}`}
          className="text-xs text-ink-soft hover:text-brand"
        >
          ← Retour au produit
        </Link>
      </div>

      {!product.audioEnabled && (
        <p className="rounded-lg border border-riso-orange bg-riso-orange/10 p-3 text-sm text-riso-orange">
          La version audio est désactivée : les pages d’écoute et les QR codes de ce pack ne
          marchent pas. Coche « Version audio (QR) » sur la fiche produit pour l’activer.
        </p>
      )}

      <Section title="1. Les mots">
        <PackCardsImport lang={lang} productId={id} />
      </Section>

      <Section title="2. Les images">
        <PackCardImagesUpload productId={id} />
      </Section>

      <Section title="3. Les QR codes à imprimer">
        <p className="text-sm text-ink-soft">
          Un QR code par carte, à placer sur la carte dans le design. Chacun ouvre la page
          d’écoute de sa carte, par exemple{" "}
          <code className="rounded bg-paper-deep px-1">{listenUrl(origin, product.slug, cards[0]?.n ?? 1)}</code>.
          Scanne un QR imprimé avec un téléphone avant de lancer toute l’impression.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {cards.length > 0 && product.audioEnabled ? (
            <a href={`/api/admin/packs/${id}/qr`} className="btn btn-brand">
              Télécharger les {cards.length} QR codes (.zip)
            </a>
          ) : (
            <span className="btn btn-ghost opacity-60">Ajoute des cartes et active l’audio d’abord</span>
          )}
          {product.audioEnabled && cards.length > 0 && (
            <a
              href={`/${lang}/ecoute/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Voir la page publique ↗
            </a>
          )}
        </div>
      </Section>

      <Section title={`Toutes les cartes (${cards.length})`}>
        {cards.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">
            Aucune carte. Commence par importer les mots (étape 1).
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <CardItem key={card.n} lang={lang} productId={id} card={card} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-line p-4">
      <legend className="px-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function CardItem({ lang, productId, card }: { lang: string; productId: string; card: PackCard }) {
  return (
    <li className="rounded-xl border border-line bg-paper p-3">
      <div className="flex gap-3">
        {card.image ? (
          <img src={card.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-riso-orange/10 text-[10px] font-bold text-riso-orange">
            sans image
          </span>
        )}
        <div className="min-w-0 flex-1 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-bold">#{card.n}</span>
            <span dir="rtl" className="truncate font-display text-base">
              {card.word.ar}
            </span>
          </div>
          <div className="truncate text-ink-soft">{card.word.fr}</div>
          <div className="truncate text-ink-soft">{card.word.en}</div>
        </div>
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-bold text-brand">Modifier</summary>
        <form action={savePackCard} className="mt-2 space-y-2">
          <input type="hidden" name="id" value={productId} />
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="n" value={card.n} />
          <input name="ar" dir="rtl" defaultValue={card.word.ar} placeholder="Arabe" className="field !py-1.5 text-sm" />
          <input name="fr" defaultValue={card.word.fr} placeholder="Français" className="field !py-1.5 text-sm" />
          <input name="en" defaultValue={card.word.en} placeholder="Anglais" className="field !py-1.5 text-sm" />
          <p className="pt-1 text-[11px] text-ink-soft">Phrase (optionnelle)</p>
          <input name="s_ar" dir="rtl" defaultValue={card.sentence?.ar} placeholder="Phrase en arabe" className="field !py-1.5 text-sm" />
          <input name="s_fr" defaultValue={card.sentence?.fr} placeholder="Phrase en français" className="field !py-1.5 text-sm" />
          <input name="s_en" defaultValue={card.sentence?.en} placeholder="Phrase en anglais" className="field !py-1.5 text-sm" />
          <label className="block pt-1 text-[11px] text-ink-soft">
            Remplacer l’image
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="mt-1 block w-full text-xs"
            />
          </label>
          <div className="flex items-center justify-between pt-1">
            <button type="submit" className="btn btn-brand !py-1.5 !text-xs">
              Enregistrer
            </button>
          </div>
        </form>
        <div className="mt-2 text-end">
          <DeletePackCardButton lang={lang} productId={productId} n={card.n} />
        </div>
      </details>
    </li>
  );
}
