import { notFound } from "next/navigation";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

// Storefront pages are statically cached; `revalidatePath` from the admin
// settings form should bust that cache on demand, but this time-based
// revalidation is a safety net so edits (shop name, contact info, shipping
// fee, product/stock changes) show up within a minute even if it doesn't.
export const revalidate = 60;

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} dict={dict} />
    </div>
  );
}
