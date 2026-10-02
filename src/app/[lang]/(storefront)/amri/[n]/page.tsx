import { permanentRedirect } from "next/navigation";
import { AMRI_PRODUCT_SLUG } from "@/lib/data/amri-cards";

/**
 * The first print run of Amri cards has QR codes encoding `/amri/<n>`. Those
 * cards are in people's homes — this redirect must stay forever.
 */
export default async function AmriCardRedirect({
  params,
}: {
  params: Promise<{ lang: string; n: string }>;
}) {
  const { lang, n } = await params;
  permanentRedirect(`/${lang}/ecoute/${AMRI_PRODUCT_SLUG}/${encodeURIComponent(n)}`);
}
