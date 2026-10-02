/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localeHref } from "@/i18n/routing";
import {
  AMRI_CARDS,
  AMRI_PRODUCT_SLUG,
  AMRI_THEMES,
  amriArt,
} from "@/lib/data/amri-cards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  // Comes with the physical pack — reachable by its QR codes, kept out of search.
  return { title: dict.amri.title, robots: { index: false } };
}

export default async function AmriPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <section className="mx-auto max-w-6xl px-[var(--page-margin)] py-10">
      <header>
        <span className="text-xs font-bold uppercase tracking-widest text-brand">
          {dict.amri.eyebrow}
        </span>
        <h1 className="mt-1 font-display text-3xl">{dict.amri.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{dict.amri.subtitle}</p>
        <p className="mt-3 text-sm font-semibold">{dict.amri.hint}</p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {AMRI_THEMES.map((theme) => (
          <a key={theme.slug} href={`#${theme.slug}`} className="tag">
            {theme.name[locale]}
          </a>
        ))}
      </nav>

      {AMRI_THEMES.map((theme) => (
        <section key={theme.slug} id={theme.slug} className="mt-10 scroll-mt-24">
          <h2 className="font-display text-xl">{theme.name[locale]}</h2>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {AMRI_CARDS.slice(theme.from - 1, theme.to).map((card) => (
              <Link
                key={card.n}
                href={localeHref(locale, `/amri/${card.n}`)}
                className="card group relative overflow-hidden p-2 text-center transition-shadow hover:shadow-md"
              >
                <span className="absolute start-2 top-2 rounded-full bg-riso-orange px-1.5 text-[11px] font-bold text-white">
                  {card.n}
                </span>
                <img
                  src={amriArt(card.n)}
                  alt={card.fr}
                  loading="lazy"
                  className="mx-auto aspect-square w-full rounded-xl object-cover transition-transform group-hover:scale-105"
                />
                <div lang="ar" dir="rtl" className="mt-1.5 font-display text-lg leading-tight">
                  {card.ar}
                </div>
                <div className="truncate text-xs text-ink-soft">
                  {card.fr} · {card.en}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <aside className="card mt-12 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg">{dict.amri.promoTitle}</h2>
          <p className="text-sm text-ink-soft">{dict.amri.promoBody}</p>
        </div>
        <Link href={localeHref(locale, `/products/${AMRI_PRODUCT_SLUG}`)} className="btn btn-brand">
          {dict.amri.promoCta}
        </Link>
      </aside>
    </section>
  );
}
