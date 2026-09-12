import Link from "next/link";
import { CartButton } from "@/components/cart/cart-button";
import { LangSwitcher } from "@/components/site/lang-switcher";
import { MobileNav } from "@/components/site/mobile-nav";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { localeHref } from "@/i18n/routing";
import { getCollections } from "@/lib/data";
import { formatMad } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_MAD, SITE_NAME } from "@/lib/site";

export async function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const collections = await getCollections();
  const primaryNav = [
    { href: localeHref(locale, "/products"), label: dict.nav.products },
    { href: localeHref(locale, "/order"), label: dict.nav.trackOrder },
    { href: localeHref(locale, "/contact"), label: dict.nav.contact },
  ];
  const sortedCollections = [...collections].sort((a, b) => a.order - b.order);
  const collectionNav = sortedCollections.slice(0, 4).map((c) => ({
    href: localeHref(locale, `/collections/${c.slug}`),
    label: c.name[locale],
  }));
  const allCollectionLinks = sortedCollections.map((c) => ({
    href: localeHref(locale, `/collections/${c.slug}`),
    label: c.name[locale],
  }));

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-brand py-2 text-center text-xs font-semibold text-white">
        🚚 {t(dict.freeShipBar, { amount: formatMad(FREE_SHIPPING_THRESHOLD_MAD, locale) })}
      </div>

      <div className="relative border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-[var(--page-margin)] py-3">
          <MobileNav
            menuLabel={dict.nav.menu}
            closeLabel={dict.nav.close}
            productsHref={localeHref(locale, "/products")}
            productsLabel={dict.nav.products}
            contactHref={localeHref(locale, "/contact")}
            contactLabel={dict.nav.contact}
            collectionsHref={localeHref(locale, "/collections")}
            collectionsLabel={dict.nav.collections}
            collectionLinks={allCollectionLinks}
            trackHref={localeHref(locale, "/order")}
            trackLabel={dict.nav.trackOrder}
          />

          <Link
            href={localeHref(locale, "/")}
            className="font-display text-xl tracking-tight text-brand"
          >
            {SITE_NAME}
          </Link>

          <nav className="ms-4 hidden items-center gap-5 text-sm font-semibold text-ink-soft md:flex">
            {primaryNav.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-3">
            <LangSwitcher current={locale} />
            <CartButton locale={locale} label={dict.nav.cart} />
          </div>
        </div>

        <div className="mx-auto hidden max-w-6xl overflow-x-auto px-[var(--page-margin)] pb-2 md:block">
          <nav className="flex items-center gap-4 whitespace-nowrap text-xs font-medium text-ink-soft">
            {collectionNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand">
                {item.label}
              </Link>
            ))}
            <Link
              href={localeHref(locale, "/collections")}
              className="text-brand hover:underline"
            >
              {dict.nav.collections} →
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
