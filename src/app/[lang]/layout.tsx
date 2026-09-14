import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Readex_Pro } from "next/font/google";

import "../globals.css";
import { CartProvider } from "@/components/cart/cart-context";
import { getDictionary } from "@/i18n/get-dictionary";
import { dir, isLocale, locales, type Locale } from "@/i18n/config";
import { getSettings } from "@/lib/data";

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-readex",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const [dict, settings] = await Promise.all([getDictionary(lang), getSettings()]);
  const siteName = settings.siteName;
  return {
    title: { default: `${siteName} — ${dict.meta.tagline}`, template: `%s · ${siteName}` },
    description: dict.meta.description,
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${readex.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
