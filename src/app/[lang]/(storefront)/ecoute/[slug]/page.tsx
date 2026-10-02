/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
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
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const pack = await getAudioPack(slug);
  if (!pack) return {};
  // Comes with the physical pack — reachable by its QR codes, kept out of search.
  return { title: pack.title[lang], robots: { index: false } };
}

/** Every card of an audio pack. */
export default async function ListenPackPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const pack = await getAudioPack(slug);
  if (!pack) notFound();
  const [dict, cards] = await Promise.all([getDictionary(locale), getPackCards(pack.id)]);

  return (
    <section className="mx-auto max-w-6xl px-[var(--page-margin)] py-10">
      <header>
        <span className="text-xs font-bold uppercase tracking-widest text-brand">
          {t(dict.listen.eyebrow, { count: cards.length })}
        </span>
        <h1 className="mt-1 font-display text-3xl">{pack.title[locale]}</h1>
        <p className="mt-1 text-sm text-ink-soft">{dict.listen.subtitle}</p>
        {cards.length > 0 && <p className="mt-3 text-sm font-semibold">{dict.listen.hint}</p>}
      </header>

      {cards.length === 0 ? (
        <p className="card mt-8 p-8 text-center text-ink-soft">{dict.listen.empty}</p>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {cards.map((card) => (
            <Link
              key={card.n}
              href={localeHref(locale, `/ecoute/${pack.slug}/${card.n}`)}
              className="card group relative overflow-hidden p-2 text-center transition-shadow hover:shadow-md"
            >
              <span className="absolute start-2 top-2 z-10 rounded-full bg-riso-orange px-1.5 text-[11px] font-bold text-white">
                {card.n}
              </span>
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.word.fr}
                  loading="lazy"
                  className="mx-auto aspect-square w-full rounded-xl object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <span className="grid aspect-square w-full place-items-center rounded-xl bg-paper-deep text-3xl">
                  🔊
                </span>
              )}
              <div lang="ar" dir="rtl" className="mt-1.5 font-display text-lg leading-tight">
                {card.word.ar}
              </div>
              <div className="truncate text-xs text-ink-soft">
                {card.word.fr} · {card.word.en}
              </div>
            </Link>
          ))}
        </div>
      )}

      {pack.isActive && (
        <aside className="card mt-12 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg">{dict.listen.promoTitle}</h2>
            <p className="text-sm text-ink-soft">{dict.listen.promoBody}</p>
          </div>
          <Link href={localeHref(locale, `/products/${pack.slug}`)} className="btn btn-brand">
            {dict.listen.promoCta}
          </Link>
        </aside>
      )}
    </section>
  );
}
