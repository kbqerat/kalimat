import type { Collection } from "./types";

/**
 * Starter collections, used as the in-memory store's initial content
 * until Supabase is wired up. Fully editable from the admin from then on.
 */
export const seedCollections: Collection[] = [
  {
    slug: "cartes-francais",
    name: {
      fr: "Cartes de vocabulaire français",
      ar: "بطاقات المفردات الفرنسية",
      en: "French vocabulary cards",
    },
    blurb: {
      fr: "Des imagiers et cartes de nomenclature pour enrichir le vocabulaire français.",
      ar: "بطاقات مصوّرة لإثراء المفردات الفرنسية.",
      en: "Picture and nomenclature cards to grow French vocabulary.",
    },
    order: 1,
  },
  {
    slug: "cartes-arabe",
    name: {
      fr: "Cartes de vocabulaire arabe",
      ar: "بطاقات المفردات العربية",
      en: "Arabic vocabulary cards",
    },
    blurb: {
      fr: "Cartes de vocabulaire et de lecture en arabe, du mot à la phrase.",
      ar: "بطاقات المفردات والقراءة بالعربية، من الكلمة إلى الجملة.",
      en: "Arabic vocabulary and reading cards, from word to sentence.",
    },
    order: 2,
  },
  {
    slug: "cartes-anglais",
    name: {
      fr: "Cartes de vocabulaire anglais",
      ar: "بطاقات المفردات الإنجليزية",
      en: "English vocabulary cards",
    },
    blurb: {
      fr: "Vocabulaire anglais illustré, thème par thème.",
      ar: "مفردات إنجليزية مصوّرة، موضوعًا تلو الآخر.",
      en: "Illustrated English vocabulary, theme by theme.",
    },
    order: 3,
  },
  {
    slug: "mathematiques",
    name: { fr: "Mathématiques", ar: "الرياضيات", en: "Math" },
    blurb: {
      fr: "Cartes et supports pour compter, reconnaître et manipuler les nombres.",
      ar: "بطاقات ووسائل للعدّ والتعرّف على الأرقام والتعامل معها.",
      en: "Cards and materials for counting and number recognition.",
    },
    order: 4,
  },
  {
    slug: "activites",
    name: { fr: "Activités", ar: "أنشطة", en: "Activities" },
    blurb: {
      fr: "Activités manuelles et jeux d'apprentissage à faire à la maison.",
      ar: "أنشطة يدوية وألعاب تعليمية للمنزل.",
      en: "Hands-on activities and learning games for home.",
    },
    order: 5,
  },
  {
    slug: "affiches",
    name: { fr: "Affiches", ar: "ملصقات", en: "Posters" },
    blurb: {
      fr: "Affiches pédagogiques à accrocher dans la chambre ou la classe.",
      ar: "ملصقات تعليمية للغرفة أو القسم.",
      en: "Educational posters for the bedroom or classroom.",
    },
    order: 6,
  },
  {
    slug: "syllabes",
    name: { fr: "Syllabes", ar: "المقاطع", en: "Syllables" },
    blurb: {
      fr: "Matériel de lecture syllabique pour démarrer la lecture.",
      ar: "مواد القراءة المقطعية للبدء في القراءة.",
      en: "Syllable reading material to start reading.",
    },
    order: 7,
  },
];
