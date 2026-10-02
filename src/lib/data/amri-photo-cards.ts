import type { PackCard } from "./types";

/**
 * Seed for the "Amri — 96 cartes photo" audio pack: the words exactly as
 * printed on the cards (photo cards, one theme per run of numbers). Same
 * role as amri-cards.ts — loaded by `npm run db:add-amri`, then edited in
 * /admin.
 *
 * Images are the cleaned card fronts in `public/pack/amri-photo/cards/`,
 * built by scripts/amri-photo/build.py along with the print PDFs.
 */

/**
 * The pack's product slug. Its printed QR codes encode
 * `/ecoute/<this slug>/<n>` — never change it.
 */
export const AMRI_PHOTO_PRODUCT_SLUG = "amri-photo-80";
export const AMRI_PHOTO_PRODUCT_ID = "prd_amri_photo_80";

// Card n is index n - 1: [ar, fr, en, then the back's sentence parts —
// "C'est <fr>." / "This is <en>." / "<ar demonstrative> <ar>."].
// Some words come twice: the print run repeats them under two numbers.
const RAW: [string, string, string, string, string, "هذا" | "هذه"][] = [
  // Animaux 1–20 (9 is a car in the print)
  ["قطة", "Chat", "Cat", "un chat", "a cat", "هذه"],
  ["كلب", "Chien", "Dog", "un chien", "a dog", "هذا"],
  ["أسد", "Lion", "Lion", "un lion", "a lion", "هذا"],
  ["نمر", "Tigre", "Tiger", "un tigre", "a tiger", "هذا"],
  ["فيل", "Éléphant", "Elephant", "un éléphant", "an elephant", "هذا"],
  ["زرافة", "Girafe", "Giraffe", "une girafe", "a giraffe", "هذه"],
  ["حصان", "Cheval", "Horse", "un cheval", "a horse", "هذا"],
  ["كلب", "Chien", "Dog", "un chien", "a dog", "هذا"],
  ["سيارة", "Voiture", "Car", "une voiture", "a car", "هذه"],
  ["خروف", "Mouton", "Sheep", "un mouton", "a sheep", "هذا"],
  ["ماعز", "Chèvre", "Goat", "une chèvre", "a goat", "هذا"],
  ["أرنب", "Lapin", "Rabbit", "un lapin", "a rabbit", "هذا"],
  ["دجاجة", "Poule", "Hen", "une poule", "a hen", "هذه"],
  ["بقرة", "Vache", "Cow", "une vache", "a cow", "هذه"],
  ["بطة", "Canard", "Duck", "un canard", "a duck", "هذه"],
  ["طائر", "Oiseau", "Bird", "un oiseau", "a bird", "هذا"],
  ["سلحفاة", "Tortue", "Turtle", "une tortue", "a turtle", "هذه"],
  ["أسد البحر", "Otarie", "Sea lion", "une otarie", "a sea lion", "هذا"],
  ["دب", "Ours", "Bear", "un ours", "a bear", "هذا"],
  ["فراشة", "Papillon", "Butterfly", "un papillon", "a butterfly", "هذه"],
  // Fruits, légumes et aliments 21–40
  ["تفاحة", "Pomme", "Apple", "une pomme", "an apple", "هذه"],
  ["موزة", "Banane", "Banana", "une banane", "a banana", "هذه"],
  ["برتقالة", "Orange", "Orange", "une orange", "an orange", "هذه"],
  ["فراولة", "Fraise", "Strawberry", "une fraise", "a strawberry", "هذه"],
  ["بطيخ", "Pastèque", "Watermelon", "une pastèque", "a watermelon", "هذا"],
  ["عنب", "Raisin", "Grape", "du raisin", "a bunch of grapes", "هذا"],
  ["كمثرى", "Poire", "Pear", "une poire", "a pear", "هذه"],
  ["خوخ", "Pêche", "Peach", "une pêche", "a peach", "هذا"],
  ["أناناس", "Ananas", "Pineapple", "un ananas", "a pineapple", "هذا"],
  ["ليمون", "Citron", "Lemon", "un citron", "a lemon", "هذا"],
  ["طماطم", "Tomate", "Tomato", "une tomate", "a tomato", "هذه"],
  ["بطاطس", "Pomme de terre", "Potato", "une pomme de terre", "a potato", "هذه"],
  ["جزر", "Carotte", "Carrot", "une carotte", "a carrot", "هذا"],
  ["خبز", "Pain", "Bread", "du pain", "bread", "هذا"],
  ["جبن", "Fromage", "Cheese", "du fromage", "cheese", "هذا"],
  ["بيضة", "Œuf", "Egg", "un œuf", "an egg", "هذه"],
  ["حليب", "Lait", "Milk", "du lait", "milk", "هذا"],
  ["ماء", "Eau", "Water", "de l'eau", "water", "هذا"],
  ["بيتزا", "Pizza", "Pizza", "une pizza", "a pizza", "هذه"],
  ["كعكة", "Gâteau", "Cake", "un gâteau", "a cake", "هذه"],
  // Transports 41–55
  ["سيارة", "Voiture", "Car", "une voiture", "a car", "هذه"],
  ["حافلة", "Bus", "Bus", "un bus", "a bus", "هذه"],
  ["شاحنة", "Camion", "Truck", "un camion", "a truck", "هذه"],
  ["دراجة", "Vélo", "Bicycle", "un vélo", "a bicycle", "هذه"],
  ["دراجة نارية", "Moto", "Motorcycle", "une moto", "a motorcycle", "هذه"],
  ["قطار", "Train", "Train", "un train", "a train", "هذا"],
  ["طائرة", "Avion", "Airplane", "un avion", "an airplane", "هذه"],
  ["سفينة", "Bateau", "Boat", "un bateau", "a boat", "هذه"],
  ["سيارة إسعاف", "Ambulance", "Ambulance", "une ambulance", "an ambulance", "هذه"],
  ["سيارة الشرطة", "Voiture de police", "Police car", "une voiture de police", "a police car", "هذه"],
  ["قطار", "Train", "Train", "un train", "a train", "هذا"],
  ["مروحية", "Hélicoptère", "Helicopter", "un hélicoptère", "a helicopter", "هذه"],
  ["طائرة", "Avion", "Airplane", "un avion", "an airplane", "هذه"],
  ["سفينة", "Bateau", "Ship", "un bateau", "a ship", "هذه"],
  ["منطاد الهواء الساخن", "Montgolfière", "Hot air balloon", "une montgolfière", "a hot air balloon", "هذا"],
  // La maison 56–70
  ["منزل", "Maison", "House", "une maison", "a house", "هذا"],
  ["باب", "Porte", "Door", "une porte", "a door", "هذا"],
  ["نافذة", "Fenêtre", "Window", "une fenêtre", "a window", "هذه"],
  ["كرسي", "Chaise", "Chair", "une chaise", "a chair", "هذا"],
  ["طاولة", "Table", "Table", "une table", "a table", "هذه"],
  ["سرير", "Lit", "Bed", "un lit", "a bed", "هذا"],
  ["أريكة", "Canapé", "Sofa", "un canapé", "a sofa", "هذه"],
  ["مصباح", "Lampe", "Lamp", "une lampe", "a lamp", "هذا"],
  ["ساعة", "Horloge", "Clock", "une horloge", "a clock", "هذه"],
  ["كتاب", "Livre", "Book", "un livre", "a book", "هذا"],
  ["كرسي", "Chaise", "Chair", "une chaise", "a chair", "هذا"],
  ["حقيبة", "Sac", "Bag", "un sac", "a bag", "هذه"],
  ["هاتف", "Téléphone", "Phone", "un téléphone", "a phone", "هذا"],
  ["مفتاح", "Clé", "Key", "une clé", "a key", "هذا"],
  ["كوب", "Tasse", "Cup", "une tasse", "a cup", "هذا"],
  // Vêtements 71–79
  ["قميص", "Chemise", "Shirt", "une chemise", "a shirt", "هذا"],
  ["سروال", "Pantalon", "Trousers", "un pantalon", "a pair of trousers", "هذا"],
  ["فستان", "Robe", "Dress", "une robe", "a dress", "هذا"],
  ["تنورة", "Jupe", "Skirt", "une jupe", "a skirt", "هذه"],
  ["معطف", "Manteau", "Coat", "un manteau", "a coat", "هذا"],
  ["سترة", "Veste", "Jacket", "une veste", "a jacket", "هذه"],
  ["حذاء", "Chaussure", "Shoe", "une chaussure", "a shoe", "هذا"],
  ["جورب", "Chaussette", "Sock", "une chaussette", "a sock", "هذا"],
  ["قبعة", "Chapeau", "Hat", "un chapeau", "a hat", "هذه"],
  // 80
  ["حفارة", "Pelleteuse", "Excavator", "une pelleteuse", "an excavator", "هذه"],
  // Engins 81–85 (84 is printed "Gr", cut short: Niveleuse)
  ["رافعة", "Grue", "Crane", "une grue", "a crane", "هذه"],
  ["جرار", "Tracteur", "Tractor", "un tracteur", "a tractor", "هذا"],
  ["شاحنة خلط الخرسانة", "Bétonnière", "Concrete mixer truck", "une bétonnière", "a concrete mixer truck", "هذه"],
  ["آلة التسوية", "Niveleuse", "Grader", "une niveleuse", "a grader", "هذه"],
  ["شاحنة قلابة", "Camion-benne", "Dump truck", "un camion-benne", "a dump truck", "هذه"],
  // Nature 86–96
  ["شجرة", "Arbre", "Tree", "un arbre", "a tree", "هذه"],
  ["زهرة", "Fleur", "Flower", "une fleur", "a flower", "هذه"],
  ["شمس", "Soleil", "Sun", "un soleil", "a sun", "هذه"],
  ["قمر", "Lune", "Moon", "une lune", "a moon", "هذا"],
  ["نجمة", "Étoile", "Star", "une étoile", "a star", "هذه"],
  ["سحابة", "Nuage", "Cloud", "un nuage", "a cloud", "هذه"],
  ["مطر", "Pluie", "Rain", "de la pluie", "rain", "هذا"],
  ["ثلج", "Neige", "Snow", "de la neige", "snow", "هذا"],
  ["جبل", "Montagne", "Mountain", "une montagne", "a mountain", "هذا"],
  ["بحر", "Mer", "Sea", "une mer", "a sea", "هذا"],
  ["نهر", "Rivière", "River", "une rivière", "a river", "هذا"],
];

export const amriPhotoCards: PackCard[] = RAW.map(([ar, fr, en, frIs, enIs, arThis], i) => ({
  productId: AMRI_PHOTO_PRODUCT_ID,
  n: i + 1,
  word: { ar, fr, en },
  sentence: { fr: `C'est ${frIs}.`, en: `This is ${enIs}.`, ar: `${arThis} ${ar}.` },
  image: `/pack/amri-photo/cards/${String(i + 1).padStart(3, "0")}.webp`,
}));
