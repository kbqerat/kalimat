import type { Localized, PackCard } from "./types";

/**
 * Seed for the "Amri — 100 cartes Premium" audio pack: the words exactly as
 * printed on the cards. The listen pages read cards from the `pack_cards`
 * table (edited in /admin); this file is what `npm run db:add-amri` loads
 * into it, and the mock backend's starting content.
 *
 * Illustrations are cropped from the print PDF into `public/pack/amri/art/`.
 */

/**
 * The pack's product slug. The QR codes printed on the first run encode
 * `/amri/<n>`, which redirects to `/ecoute/<this slug>/<n>` — never change
 * either.
 */
export const AMRI_PRODUCT_SLUG = "amri-100-cartes-premium";
export const AMRI_PRODUCT_ID = "prd_amri_100";

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

function amriArt(n: number): string {
  return `/pack/amri/art/${String(n).padStart(3, "0")}.webp`;
}

/** The back-of-card "phrase utile": "Je vois une pomme." / "I see an apple." */
function amriSentence(ar: string, fr: string, en: string): Localized {
  const definite = /^(le|la) /.test(fr);
  const article = definite ? "the" : /^[aeiou]/i.test(en) ? "an" : "a";
  return { fr: `Je vois ${fr}.`, ar: `أنا أرى ${ar}`, en: `I see ${article} ${en}.` };
}

export const seedPackCards: PackCard[] = RAW.map(([ar, fr, en], i) => ({
  productId: AMRI_PRODUCT_ID,
  n: i + 1,
  word: { ar, fr, en },
  sentence: amriSentence(ar, fr, en),
  image: amriArt(i + 1),
}));
