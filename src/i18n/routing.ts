import type { Locale } from "./config";

/** Build an in-app path for a locale: localeHref("fr", "/decks") -> "/fr/decks" */
export function localeHref(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Swap the locale segment of the current pathname. */
export function switchLocalePath(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  // parts[0] is "" ; parts[1] is the current locale
  parts[1] = next;
  return parts.join("/") || `/${next}`;
}
