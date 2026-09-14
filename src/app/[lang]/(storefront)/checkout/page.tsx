import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.checkout.title };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  return (
    <section className="mx-auto max-w-6xl px-[var(--page-margin)] py-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl">{dict.checkout.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{dict.checkout.subtitle}</p>
      </header>
      <CheckoutForm
        locale={locale}
        dict={dict}
        shippingFlatMad={settings.shippingFlatMad}
        freeShippingThresholdMad={settings.freeShippingThresholdMad}
      />
    </section>
  );
}
