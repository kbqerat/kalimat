/**
 * Store-wide configuration. `SITE_NAME` is a placeholder — swap it here.
 */
export const SITE_NAME = "Kalimat";

export const SITE_DOMAIN = "kalimat.ma";

/** Store contact details. Phone is still a placeholder — swap it here. */
export const CONTACT_PHONE = "+212 6 00 00 00 00";
export const CONTACT_EMAIL = "Medamri4848@gmail.com";
export const CONTACT_CITY = "Oujda, Maroc";
export const CONTACT_COORDS = { lat: 34.6814, lon: -1.9086 };

/** WhatsApp contact number, international format (no spaces, no "+"), for wa.me links. */
export const WHATSAPP_NUMBER = "212600029060";
export const WHATSAPP_DISPLAY = "06 00 02 90 60";

/** Shipping, in MAD. Flat fee, waived above the free-shipping threshold. */
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

export function shippingFor(subtotalMad: number): number {
  if (subtotalMad <= 0) return 0;
  return subtotalMad >= FREE_SHIPPING_THRESHOLD_MAD ? 0 : SHIPPING_FLAT_MAD;
}
