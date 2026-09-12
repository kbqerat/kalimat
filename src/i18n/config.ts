export const locales = ["fr", "ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};

/** Short label used in the language switcher pills. */
export const localeShort: Record<Locale, string> = {
  fr: "FR",
  ar: "ع",
  en: "EN",
};

export const rtlLocales: Locale[] = ["ar"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Narrows an untrusted value (e.g. a form field) to a known locale. */
export function safeLocale(value: unknown): Locale {
  const s = String(value ?? "");
  return isLocale(s) ? s : defaultLocale;
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
