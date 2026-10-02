import type { Locale } from "@/i18n/config";

/**
 * The "Amri — 100 cartes Premium" pack, card by card, as printed. Powers the
 * free online version (`/[lang]/amri`) that buyers of the physical pack reach
 * through the "Écoute / استمع" QR code on each card — each QR should encode
 * `https://<domain>/amri/<n>` (the proxy adds the visitor's locale).
 *
 * Illustrations are cropped from the print PDF into `public/pack/amri/art/`.
 */

/** Slug of the physical pack's product — its page advertises the online version. */
export const AMRI_PRODUCT_SLUG = "amri-100-cartes-premium";

export type AmriTheme =
  | "fruits"
  | "vegetables"
  | "food"
  | "animals"
  | "transport"
  | "nature"
  | "home"
  | "objects";

export const AMRI_THEMES: { slug: AmriTheme; from: number; to: number; name: Record<Locale, string> }[] = [
  { slug: "fruits", from: 1, to: 10, name: { fr: "Fruits", ar: "الفواكه", en: "Fruits" } },
  { slug: "vegetables", from: 11, to: 18, name: { fr: "Légumes", ar: "الخضر", en: "Vegetables" } },
  { slug: "food", from: 19, to: 26, name: { fr: "Nourriture", ar: "الأطعمة", en: "Food" } },
  { slug: "animals", from: 27, to: 50, name: { fr: "Animaux", ar: "الحيوانات", en: "Animals" } },
  { slug: "transport", from: 51, to: 60, name: { fr: "Transports", ar: "وسائل النقل", en: "Transport" } },
  { slug: "nature", from: 61, to: 72, name: { fr: "Nature", ar: "الطبيعة", en: "Nature" } },
  { slug: "home", from: 73, to: 78, name: { fr: "La maison", ar: "البيت", en: "Home" } },
  { slug: "objects", from: 79, to: 100, name: { fr: "Objets", ar: "الأشياء", en: "Objects" } },
];

export interface AmriCard {
  n: number;
  ar: string;
  /** French with its article, as printed: "une pomme". */
  fr: string;
  en: string;
}

// [ar, fr, en] in card order — card n is index n - 1.
const RAW: [string, string, string][] = [
  ["تفاحة", "une pomme", "apple"],
  ["موزة", "une banane", "banana"],
  ["برتقالة", "une orange", "orange"],
  ["فراولة", "une fraise", "strawberry"],
  ["بطيخة", "une pastèque", "watermelon"],
  ["ليمونة", "un citron", "lemon"],
  ["كرزة", "une cerise", "cherry"],
  ["خوخة", "une pêche", "peach"],
  ["أناناس", "un ananas", "pineapple"],
  ["إجاصة", "une poire", "pear"],
  ["جزرة", "une carotte", "carrot"],
  ["طماطم", "une tomate", "tomato"],
  ["ذرة", "un maïs", "corn"],
  ["فلفل", "un piment", "chili pepper"],
  ["بطاطس", "une pomme de terre", "potato"],
  ["بصلة", "un oignon", "onion"],
  ["بروكلي", "un brocoli", "broccoli"],
  ["خيار", "un concombre", "cucumber"],
  ["خبز", "un pain", "loaf"],
  ["دونات", "un donut", "donut"],
  ["بيضة", "un oeuf", "egg"],
  ["بيتزا", "une pizza", "pizza"],
  ["همبرغر", "un hamburger", "burger"],
  ["آيس كريم", "une glace", "ice cream"],
  ["بسكويت", "un biscuit", "cookie"],
  ["شوكولاتة", "un chocolat", "chocolate"],
  ["أسد", "un lion", "lion"],
  ["قطة", "un chat", "cat"],
  ["كلب", "un chien", "dog"],
  ["حصان", "un cheval", "horse"],
  ["بقرة", "une vache", "cow"],
  ["خروف", "un mouton", "sheep"],
  ["سمكة", "un poisson", "fish"],
  ["عصفور", "un oiseau", "bird"],
  ["أرنب", "un lapin", "rabbit"],
  ["فيل", "un éléphant", "elephant"],
  ["قرد", "un singe", "monkey"],
  ["دب", "un ours", "bear"],
  ["كتكوت", "un poussin", "chick"],
  ["دجاجة", "une poule", "hen"],
  ["فراشة", "un papillon", "butterfly"],
  ["نحلة", "une abeille", "bee"],
  ["ضفدع", "une grenouille", "frog"],
  ["سلحفاة", "une tortue", "turtle"],
  ["زرافة", "une girafe", "giraffe"],
  ["دولفين", "un dauphin", "dolphin"],
  ["حوت", "une baleine", "whale"],
  ["نمر", "un tigre", "tiger"],
  ["ثعلب", "un renard", "fox"],
  ["بومة", "un hibou", "owl"],
  ["سيارة", "une voiture", "car"],
  ["حافلة", "un bus", "bus"],
  ["قطار", "un train", "train"],
  ["طائرة", "un avion", "plane"],
  ["سفينة", "un bateau", "boat"],
  ["دراجة", "un vélo", "bike"],
  ["مروحية", "un hélicoptère", "helicopter"],
  ["سيارة إسعاف", "une ambulance", "ambulance"],
  ["جرار", "un tracteur", "tractor"],
  ["سيارة أجرة", "un taxi", "taxi"],
  ["شمس", "le soleil", "sun"],
  ["قمر", "la lune", "moon"],
  ["نجمة", "une étoile", "star"],
  ["سحابة", "un nuage", "cloud"],
  ["شجرة", "un arbre", "tree"],
  ["وردة", "une fleur", "flower"],
  ["جبل", "une montagne", "mountain"],
  ["نار", "un feu", "fire"],
  ["قطرة", "une goutte", "drop"],
  ["صبار", "un cactus", "cactus"],
  ["نخلة", "un palmier", "palm tree"],
  ["فطر", "un champignon", "mushroom"],
  ["بيت", "une maison", "house"],
  ["كرسي", "une chaise", "chair"],
  ["سرير", "un lit", "bed"],
  ["مصباح", "une lampe", "lamp"],
  ["تلفاز", "une télé", "TV"],
  ["باب", "une porte", "door"],
  ["هدية", "un cadeau", "gift"],
  ["كرة", "un ballon", "ball"],
  ["دمية", "une peluche", "teddy bear"],
  ["كتاب", "un livre", "book"],
  ["قلم", "un crayon", "pencil"],
  ["حقيبة", "un sac", "bag"],
  ["منبه", "un réveil", "alarm clock"],
  ["ملعقة", "une cuillère", "spoon"],
  ["قميص", "un t-shirt", "T-shirt"],
  ["قبعة", "une casquette", "cap"],
  ["حذاء", "une chaussure", "shoe"],
  ["غيتار", "une guitare", "guitar"],
  ["كرة السلة", "un ballon de basket", "basketball"],
  ["كأس", "une coupe", "trophy"],
  ["خيمة", "une tente", "tent"],
  ["مفتاح", "une clé", "key"],
  ["بالون", "un ballon de fête", "balloon"],
  ["جرس", "une cloche", "bell"],
  ["صحن", "une assiette", "plate"],
  ["عدسة مكبرة", "une loupe", "magnifying glass"],
  ["علم", "un drapeau", "flag"],
  ["كوب", "un verre", "glass"],
];

export const AMRI_CARDS: AmriCard[] = RAW.map(([ar, fr, en], i) => ({ n: i + 1, ar, fr, en }));

export const AMRI_CARD_COUNT = AMRI_CARDS.length;

export function getAmriCard(n: number): AmriCard | undefined {
  return Number.isInteger(n) ? AMRI_CARDS[n - 1] : undefined;
}

export function amriArt(n: number): string {
  return `/pack/amri/art/${String(n).padStart(3, "0")}.webp`;
}

export function amriTheme(n: number) {
  return AMRI_THEMES.find((t) => n >= t.from && n <= t.to)!;
}

/** The back-of-card "phrase utile": "Je vois une pomme." / "I see an apple." */
export function amriSentence(card: AmriCard): Record<Locale, string> {
  const definite = /^(le|la) /.test(card.fr);
  const article = definite ? "the" : /^[aeiou]/i.test(card.en) ? "an" : "a";
  return {
    fr: `Je vois ${card.fr}.`,
    ar: `أنا أرى ${card.ar}`,
    en: `I see ${article} ${card.en}.`,
  };
}
