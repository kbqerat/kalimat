/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CardPlayer } from "@/components/amri/card-player";
import { dir, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localeHref } from "@/i18n/routing";
import { t } from "@/i18n/t";
import {
  AMRI_CARDS,
  AMRI_CARD_COUNT,
  amriArt,
  amriSentence,
  amriTheme,
  getAmriCard,
} from "@/lib/data/amri-cards";

export function generateStaticParams() {
  return AMRI_CARDS.map((card) => ({ n: String(card.n) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; n: string }>;
}): Promise<Metadata> {
  const { lang, n } = await params;
  const card = getAmriCard(Number(n));
  if (!isLocale(lang) || !card) return {};
  return { title: `${card.n}. ${card[lang]}`, robots: { index: false } };
}

/** One card — the page its printed "Écoute / استمع" QR code opens. */
export default async function AmriCardPage({
  params,
}: {
  params: Promise<{ lang: string; n: string }>;
}) {
  const { lang, n } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const card = getAmriCard(Number(n));
  if (!card) notFound();
  const dict = await getDictionary(locale);
  const theme = amriTheme(card.n);
  const prev = card.n > 1 ? card.n - 1 : null;
  const next = card.n < AMRI_CARD_COUNT ? card.n + 1 : null;
  const [back, forward] = dir(locale) === "rtl" ? ["→", "←"] : ["←", "→"];

  return (
    <article className="mx-auto max-w-4xl px-[var(--page-margin)] py-8">
      <Link
        href={localeHref(locale, `/amri#${theme.slug}`)}
        className="text-sm text-ink-soft hover:text-brand"
      >
        {back} {dict.amri.allCards}
      </Link>

      <div className="mt-5 grid items-start gap-6 md:grid-cols-2">
        <div className="card relative overflow-hidden">
          <img
            src={amriArt(card.n)}
            alt={card.fr}
            className="aspect-square w-full object-cover"
          />
          <span className="badge-sale absolute start-4 top-4">
            {t(dict.amri.cardOf, { n: card.n, total: AMRI_CARD_COUNT })}
          </span>
          <span className="tag absolute end-4 top-4">{theme.name[locale]}</span>
        </div>

        <CardPlayer
          key={card.n}
          card={card}
          sentence={amriSentence(card)}
          labels={{
            listen: dict.amri.listen,
            listenAll: dict.amri.listenAll,
            sentenceTitle: dict.amri.sentenceTitle,
            noSpeech: dict.amri.noSpeech,
            noVoice: dict.amri.noVoice,
          }}
        />
      </div>

      <nav className="mt-8 flex items-center justify-between gap-3">
        {prev ? (
          <Link href={localeHref(locale, `/amri/${prev}`)} className="btn btn-ghost">
            {back} {dict.amri.prev}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={localeHref(locale, `/amri/${next}`)} className="btn btn-brand">
            {dict.amri.next} {forward}
          </Link>
        )}
      </nav>
    </article>
  );
}
