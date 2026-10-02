/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CardPlayer } from "@/components/listen/card-player";
import { dir, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localeHref } from "@/i18n/routing";
import { t } from "@/i18n/t";
import { getAudioPack, getPackCards } from "@/lib/data";

// Rendered on first visit, then cached (see the storefront layout's revalidate).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; n: string }>;
}): Promise<Metadata> {
  const { lang, slug, n } = await params;
  if (!isLocale(lang)) return {};
  const pack = await getAudioPack(slug);
  const card = pack && (await getPackCards(pack.id)).find((c) => c.n === Number(n));
  if (!card) return {};
  return { title: `${card.n}. ${card.word[lang]}`, robots: { index: false } };
}

/** One card — the page its printed QR code opens. */
export default async function ListenCardPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string; n: string }>;
}) {
  const { lang, slug, n } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const pack = await getAudioPack(slug);
  if (!pack) notFound();
  const [dict, cards] = await Promise.all([getDictionary(locale), getPackCards(pack.id)]);
  // Card numbers come from print and may have gaps, so step through the list.
  const i = cards.findIndex((c) => c.n === Number(n));
  if (i < 0) notFound();
  const card = cards[i];
  const prev = cards[i - 1];
  const next = cards[i + 1];
  const last = cards[cards.length - 1].n;
  const [back, forward] = dir(locale) === "rtl" ? ["→", "←"] : ["←", "→"];

  return (
    <article className="mx-auto max-w-4xl px-[var(--page-margin)] py-8">
      <Link
        href={localeHref(locale, `/ecoute/${pack.slug}`)}
        className="text-sm text-ink-soft hover:text-brand"
      >
        {back} {dict.listen.allCards}
      </Link>

      <div className="mt-5 grid items-start gap-6 md:grid-cols-2">
        <div className="card relative overflow-hidden">
          {card.image ? (
            <img src={card.image} alt={card.word.fr} className="aspect-square w-full bg-white object-contain" />
          ) : (
            <span className="grid aspect-square w-full place-items-center bg-paper-deep text-7xl">
              🔊
            </span>
          )}
          <span className="badge-sale absolute start-4 top-4">
            {t(dict.listen.cardOf, { n: card.n, total: last })}
          </span>
        </div>

        <CardPlayer
          key={card.n}
          word={card.word}
          sentence={card.sentence}
          labels={{
            listen: dict.listen.listen,
            listenAll: dict.listen.listenAll,
            sentenceTitle: dict.listen.sentenceTitle,
            noSpeech: dict.listen.noSpeech,
            noVoice: dict.listen.noVoice,
          }}
        />
      </div>

      <nav className="mt-8 flex items-center justify-between gap-3">
        {prev ? (
          <Link href={localeHref(locale, `/ecoute/${pack.slug}/${prev.n}`)} className="btn btn-ghost">
            {back} {dict.listen.prev}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={localeHref(locale, `/ecoute/${pack.slug}/${next.n}`)} className="btn btn-brand">
            {dict.listen.next} {forward}
          </Link>
        )}
      </nav>
    </article>
  );
}
