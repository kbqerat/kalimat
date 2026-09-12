import { ProductCard } from "@/components/product/product-card";
import type { CollectionWithCount } from "@/lib/data";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Product } from "@/lib/data/types";

export function ProductGrid({
  products,
  collections,
  locale,
  dict,
}: {
  products: Product[];
  collections: CollectionWithCount[];
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            collections={collections}
            locale={locale}
            dict={dict}
          />
        </li>
      ))}
    </ul>
  );
}
