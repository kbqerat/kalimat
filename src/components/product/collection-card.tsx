import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { localeHref } from "@/i18n/routing";
import { collectionStyle } from "@/lib/collection-visuals";
import type { CollectionWithCount } from "@/lib/data";

export function CollectionCard({
  collection,
  locale,
  dict,
}: {
  collection: CollectionWithCount;
  locale: Locale;
  dict: Dictionary;
}) {
  const style = collectionStyle(collection.slug);

  return (
    <Link
      href={localeHref(locale, `/collections/${collection.slug}`)}
      className="card group relative flex flex-col items-start gap-1 overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -end-6 -top-6 h-20 w-20 rounded-full opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-100 ${style.tint}`}
      />
      <span
        className={`relative grid h-12 w-12 place-items-center rounded-xl text-xl shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${style.tint}`}
      >
        {style.icon}
      </span>
      <span className="relative mt-2 font-display text-sm leading-snug">
        {collection.name[locale]}
      </span>
      <span className="relative flex items-center gap-1 text-xs text-ink-soft">
        {t(dict.collections.itemCount, { count: collection.count })}
        <span
          aria-hidden
          className="text-brand opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}
