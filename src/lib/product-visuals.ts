import type { ProductType } from "@/lib/data/types";

/** Icon + gradient tint shown in place of a missing product photo. */
export const PRODUCT_PLACEHOLDER: Record<
  ProductType,
  { icon: string; from: string; to: string }
> = {
  cards: { icon: "🗂️", from: "from-brand/15", to: "to-brand/5" },
  box: { icon: "📦", from: "from-riso-teal/20", to: "to-riso-teal/5" },
  poster: { icon: "🖼️", from: "from-riso-yellow/25", to: "to-riso-yellow/5" },
  pack: { icon: "🎁", from: "from-riso-pink/20", to: "to-riso-pink/5" },
  activity: { icon: "🧩", from: "from-riso-purple/20", to: "to-riso-purple/5" },
  syllables: { icon: "🔡", from: "from-riso-orange/20", to: "to-riso-orange/5" },
};
