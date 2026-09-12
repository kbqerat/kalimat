import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/site/track-order-form";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.track.title };
}

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <section className="mx-auto max-w-2xl px-[var(--page-margin)] py-14">
      <div className="card p-8 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-2xl">
          📦
        </span>
        <h1 className="mt-4 font-display text-2xl sm:text-3xl">{dict.track.title}</h1>
        <p className="mt-2 text-sm text-ink-soft">{dict.track.subtitle}</p>

        <TrackOrderForm
          locale={locale}
          placeholder={dict.track.placeholder}
          cta={dict.track.cta}
          errorText={dict.track.error}
        />
      </div>
    </section>
  );
}
