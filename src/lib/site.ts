/**
 * Store-wide configuration. The values below are the seed defaults for the
 * editable `settings` table (see `src/db/schema.sql` and `getSettings()` in
 * `src/lib/data/index.ts`) — the site name, shipping fees and contact phone
 * / email / WhatsApp number are edited from /admin/settings and read from
 * Supabase from there on. Everything else here (domain, map location, city
 * list) isn't part of that table and stays a plain constant.
 */
export const SITE_NAME = "Kalimat";

export const SITE_DOMAIN = "kalimat.ma";

/** Map location shown on the contact page. Not editable from the admin. */
export const CONTACT_CITY = "Oujda, Maroc";
export const CONTACT_COORDS = { lat: 34.6814, lon: -1.9086 };

/** Seed defaults for `settings` — editable from /admin/settings once Supabase is connected. */
export const CONTACT_PHONE = "0782-644852";
export const CONTACT_EMAIL = "Medamri4848@gmail.com";
export const WHATSAPP_NUMBER = "212782644852";
export const SHIPPING_FLAT_MAD = 25;
export const FREE_SHIPPING_THRESHOLD_MAD = 180;

/** Moroccan cities offered in the checkout dropdown. */
export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Nador",
  "El Jadida",
  "Béni Mellal",
  "Mohammédia",
  "Khouribga",
  "Safi",
  "Essaouira",
  "Ifrane",
  "Dakhla",
  "Laâyoune",
] as const;

export function shippingFor(
  subtotalMad: number,
  flatMad: number = SHIPPING_FLAT_MAD,
  freeThresholdMad: number = FREE_SHIPPING_THRESHOLD_MAD,
): number {
  if (subtotalMad <= 0) return 0;
  return subtotalMad >= freeThresholdMad ? 0 : flatMad;
}
