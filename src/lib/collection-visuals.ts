/** Icon + tint shown for each collection. Falls back to a generic book. */
export const COLLECTION_STYLE: Record<string, { icon: string; tint: string }> = {
  "cartes-francais": { icon: "📘", tint: "bg-brand/10" },
  "cartes-arabe": { icon: "📗", tint: "bg-riso-teal/10" },
  "cartes-anglais": { icon: "📙", tint: "bg-riso-orange/10" },
  mathematiques: { icon: "🔢", tint: "bg-riso-purple/10" },
  activites: { icon: "🧩", tint: "bg-riso-pink/10" },
  affiches: { icon: "🖼️", tint: "bg-riso-yellow/20" },
  syllabes: { icon: "🔡", tint: "bg-riso-teal/10" },
};
export const DEFAULT_COLLECTION_STYLE = { icon: "📚", tint: "bg-paper-deep" };

export function collectionStyle(slug: string) {
  return COLLECTION_STYLE[slug] ?? DEFAULT_COLLECTION_STYLE;
}
