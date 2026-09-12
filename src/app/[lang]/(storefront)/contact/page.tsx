import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  CONTACT_CITY,
  CONTACT_COORDS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
} from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.contact.title };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  const { lat, lon } = CONTACT_COORDS;
  const bbox = [lon - 0.045, lat - 0.03, lon + 0.045, lat + 0.03].join(",");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  const telHref = `tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`;

  const infoCards = [
    {
      icon: "📍",
      tint: "bg-brand/10",
      label: dict.contact.addressTitle,
      value: CONTACT_CITY,
    },
    {
      icon: "📞",
      tint: "bg-riso-teal/10",
      label: dict.contact.phoneTitle,
      value: CONTACT_PHONE,
      href: telHref,
    },
    {
      icon: "✉️",
      tint: "bg-riso-orange/10",
      label: dict.contact.emailTitle,
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-[var(--page-margin)] py-10">
      <header className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-2xl">
          💬
        </span>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl">
          {dict.contact.title}
        </h1>
        <p className="mt-2 text-sm text-ink-soft sm:text-base">
          {dict.contact.subtitle}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href={telHref} className="btn btn-primary">
            📞 {dict.contact.callCta}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-ghost">
            ✉️ {dict.contact.emailCta}
          </a>
        </div>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
        {infoCards.map((c) => {
          const Wrapper = c.href ? "a" : "div";
          return (
            <Wrapper
              key={c.label}
              {...(c.href ? { href: c.href } : {})}
              className="card flex flex-col items-start gap-3 p-5 transition-transform hover:-translate-y-0.5"
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-full text-lg ${c.tint}`}
              >
                {c.icon}
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-ink-soft">
                  {c.label}
                </span>
                <span className="mt-0.5 block text-sm font-semibold" dir="ltr">
                  {c.value}
                </span>
              </span>
            </Wrapper>
          );
        })}
      </div>

      <div className="mt-10 card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
          <div>
            <h2 className="font-display text-lg">🗺️ {dict.contact.mapTitle}</h2>
            <p className="mt-0.5 text-sm text-ink-soft">{CONTACT_CITY}</p>
          </div>
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost !py-2 !text-sm"
          >
            {dict.contact.viewLargerMap} →
          </a>
        </div>
        <iframe
          title={dict.contact.mapTitle}
          src={mapSrc}
          className="h-80 w-full border-0 sm:h-96"
          loading="lazy"
        />
      </div>
    </section>
  );
}
