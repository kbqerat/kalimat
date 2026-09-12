"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeShort, type Locale } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LangSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`;

  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label="Language">
      {locales.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, l)}
          hrefLang={l}
          aria-current={l === current ? "true" : undefined}
          onClick={() => {
            document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
          }}
          className={cn(
            "grid h-7 min-w-7 place-items-center rounded-full px-1.5 font-semibold uppercase leading-none transition-colors",
            l === current
              ? "bg-brand text-white"
              : "text-ink-soft hover:bg-paper-deep",
          )}
        >
          {localeShort[l]}
        </Link>
      ))}
    </div>
  );
}
