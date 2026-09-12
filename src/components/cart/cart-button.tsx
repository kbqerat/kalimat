"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { localeHref } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";

export function CartButton({ locale, label }: { locale: Locale; label: string }) {
  const { count, ready } = useCart();

  return (
    <Link
      href={localeHref(locale, "/cart")}
      aria-label={label}
      className="relative inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
    >
      <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden className="shrink-0">
        <path
          d="M1 2h2l1.6 8.2a1 1 0 0 0 1 .8h6.1a1 1 0 0 0 1-.8L15 4H4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="6.5" cy="14" r="1.2" fill="currentColor" />
        <circle cx="12.5" cy="14" r="1.2" fill="currentColor" />
      </svg>
      <span className="hidden sm:inline">{label}</span>
      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-riso-orange px-1 text-[11px] font-bold text-white">
        {ready ? count : 0}
      </span>
    </Link>
  );
}
