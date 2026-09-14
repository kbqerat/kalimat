import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
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
  return { title: dict.cart.title };
}

export default async function CartPage({
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
      <h1 className="mb-8 font-display text-2xl sm:text-3xl">{dict.cart.title}</h1>
      <CartView
        locale={locale}
        dict={dict}
        shippingFlatMad={settings.shippingFlatMad}
        freeShippingThresholdMad={settings.freeShippingThresholdMad}
      />
    </section>
  );
}
