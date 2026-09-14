import { notFound } from "next/navigation";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";

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
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} dict={dict} />
      <WhatsappButton label={dict.whatsapp.cta} whatsappNumber={settings.whatsappNumber} />
    </div>
  );
}
