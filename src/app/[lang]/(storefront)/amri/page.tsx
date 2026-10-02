import { permanentRedirect } from "next/navigation";
import { AMRI_PRODUCT_SLUG } from "@/lib/data/amri-cards";

/** Old address of the Amri listen pages — kept so links to it still work. */
export default async function AmriRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  permanentRedirect(`/${lang}/ecoute/${AMRI_PRODUCT_SLUG}`);
}
