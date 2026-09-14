import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localeHref } from "@/i18n/routing";
import { getCollections, getSettings } from "@/lib/data";

export async function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const [collections, settings] = await Promise.all([getCollections(), getSettings()]);
  const cols = [...collections].sort((a, b) => a.order - b.order).slice(0, 5);

  return (
    <footer className="mt-20 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-[var(--page-margin)] py-12 text-center sm:grid-cols-[2fr_1fr_1fr] sm:text-start">
        <div className="mx-auto max-w-xs sm:mx-0">
          <div className="font-display text-lg text-brand">{settings.siteName}</div>
          <p className="mt-3 text-sm text-ink-soft">{dict.footer.blurb}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            {dict.footer.shop}
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href={localeHref(locale, "/products")} className="hover:text-brand">
                {dict.nav.products}
              </Link>
            </li>
            {cols.map((c) => (
              <li key={c.slug}>
                <Link
                  href={localeHref(locale, `/collections/${c.slug}`)}
                  className="hover:text-brand"
                >
                  {c.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            {dict.footer.help}
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            <li>{dict.footer.shipping}</li>
            <li>{dict.cart.codBadge}</li>
            <li>
              <Link href={localeHref(locale, "/order")} className="hover:text-brand">
                {dict.footer.trackOrder}
              </Link>
            </li>
            <li>
              <Link href={localeHref(locale, "/contact")} className="hover:text-brand">
                {dict.footer.contact}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-[var(--page-margin)] py-4 text-center text-xs text-ink-soft sm:flex-row sm:text-start">
          <span>
            © {year} {settings.siteName}. {dict.footer.rights}
          </span>
          <span>{dict.footer.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}
