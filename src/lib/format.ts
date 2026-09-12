import type { Locale } from "@/i18n/config";

const CURRENCY_LABEL: Record<Locale, string> = {
  fr: "DH",
  en: "MAD",
  ar: "درهم",
};

/** "89 DH" / "89 MAD" / "٨٩ درهم" — price with the localised currency label. */
export function formatMad(amount: number, locale: Locale): string {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
    maximumFractionDigits: 0,
  }).format(amount);
  return locale === "ar" ? `${n} ${CURRENCY_LABEL.ar}` : `${n} ${CURRENCY_LABEL[locale]}`;
}

/** Moroccan mobile: 06/07 + 8 digits, spaces or dashes tolerated. */
export function isValidMoroccanPhone(raw: string): boolean {
  const digits = raw.replace(/[\s.-]/g, "");
  return /^(?:0|\+212|00212)(6|7)\d{8}$/.test(digits);
}

/** Normalise to 06XXXXXXXX / 07XXXXXXXX. */
export function normalizeMoroccanPhone(raw: string): string {
  const digits = raw.replace(/[\s.-]/g, "");
  if (digits.startsWith("+212")) return "0" + digits.slice(4);
  if (digits.startsWith("00212")) return "0" + digits.slice(5);
  return digits;
}

/** "Cartes de Français" → "cartes-de-francais". Strips accents. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Appends -2, -3, … to `base` until it's not in `existing`. */
export function uniqueSlug(base: string, existing: string[]): string {
  const taken = new Set(existing);
  const root = base || "item";
  if (!taken.has(root)) return root;
  let i = 2;
  while (taken.has(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}
