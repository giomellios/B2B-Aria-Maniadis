/*
 * Destination detection for souvenir products ("ΚΑΠΕΛΟ ΤΖΟΚΕΪ ΜΥΚΟΝΟΣ" → Μύκονος). The CSV has no
 * destination column, so it is read from the product name. Pure functions only.
 *
 * To support a new destination, add an entry: `keywords` are whole words of the name, compared
 * upper-case and without accents.
 */

export interface Destination {
  code: string;
  name: { el: string; en: string };
  keywords: string[];
}

export const DESTINATIONS: Destination[] = [
  {
    code: "greece",
    name: { el: "Ελλάδα", en: "Greece" },
    keywords: ["GREECE", "ΕΛΛΑΣ", "ΕΛΛΑΔΑ", "HELLAS"],
  },
  { code: "athens", name: { el: "Αθήνα", en: "Athens" }, keywords: ["ΑΘΗΝΑ", "ATHENS"] },
  { code: "mykonos", name: { el: "Μύκονος", en: "Mykonos" }, keywords: ["ΜΥΚΟΝΟΣ", "MYKONOS"] },
  {
    code: "santorini",
    name: { el: "Σαντορίνη", en: "Santorini" },
    keywords: ["ΣΑΝΤΟΡΙΝΗ", "SANTORINI", "ΘΗΡΑ"],
  },
  { code: "crete", name: { el: "Κρήτη", en: "Crete" }, keywords: ["ΚΡΗΤΗ", "CRETE", "KRITI"] },
  { code: "chania", name: { el: "Χανιά", en: "Chania" }, keywords: ["ΧΑΝΙΑ", "CHANIA"] },
  {
    code: "heraklion",
    name: { el: "Ηράκλειο", en: "Heraklion" },
    keywords: ["ΗΡΑΚΛΕΙΟ", "HERAKLION"],
  },
  { code: "rethymno", name: { el: "Ρέθυμνο", en: "Rethymno" }, keywords: ["ΡΕΘΥΜΝΟ", "RETHYMNO"] },
  { code: "rhodes", name: { el: "Ρόδος", en: "Rhodes" }, keywords: ["ΡΟΔΟΣ", "RHODES", "RODOS"] },
  { code: "lindos", name: { el: "Λίνδος", en: "Lindos" }, keywords: ["ΛΙΝΔΟΣ", "LINDOS"] },
  { code: "kos", name: { el: "Κως", en: "Kos" }, keywords: ["ΚΩΣ", "KOS"] },
  { code: "tinos", name: { el: "Τήνος", en: "Tinos" }, keywords: ["ΤΗΝΟΣ", "TINOS"] },
  { code: "naxos", name: { el: "Νάξος", en: "Naxos" }, keywords: ["ΝΑΞΟΣ", "NAXOS"] },
  { code: "paros", name: { el: "Πάρος", en: "Paros" }, keywords: ["ΠΑΡΟΣ", "PAROS"] },
  { code: "milos", name: { el: "Μήλος", en: "Milos" }, keywords: ["ΜΗΛΟΣ", "MILOS"] },
  { code: "ios", name: { el: "Ίος", en: "Ios" }, keywords: ["ΙΟΣ", "IOS"] },
  { code: "syros", name: { el: "Σύρος", en: "Syros" }, keywords: ["ΣΥΡΟΣ", "SYROS"] },
  { code: "andros", name: { el: "Άνδρος", en: "Andros" }, keywords: ["ΑΝΔΡΟΣ", "ANDROS"] },
  { code: "sifnos", name: { el: "Σίφνος", en: "Sifnos" }, keywords: ["ΣΙΦΝΟΣ", "SIFNOS"] },
  { code: "amorgos", name: { el: "Αμοργός", en: "Amorgos" }, keywords: ["ΑΜΟΡΓΟΣ", "AMORGOS"] },
  { code: "patmos", name: { el: "Πάτμος", en: "Patmos" }, keywords: ["ΠΑΤΜΟΣ", "PATMOS"] },
  {
    code: "zakynthos",
    name: { el: "Ζάκυνθος", en: "Zakynthos" },
    keywords: ["ΖΑΚΥΝΘΟΣ", "ZAKYNTHOS", "ZANTE"],
  },
  {
    code: "corfu",
    name: { el: "Κέρκυρα", en: "Corfu" },
    keywords: ["ΚΕΡΚΥΡΑ", "CORFU", "KERKYRA"],
  },
  {
    code: "kefalonia",
    name: { el: "Κεφαλονιά", en: "Kefalonia" },
    keywords: ["ΚΕΦΑΛΟΝΙΑ", "KEFALONIA", "CEPHALONIA"],
  },
  { code: "lefkada", name: { el: "Λευκάδα", en: "Lefkada" }, keywords: ["ΛΕΥΚΑΔΑ", "LEFKADA"] },
  { code: "paxoi", name: { el: "Παξοί", en: "Paxos" }, keywords: ["ΠΑΞΟΙ", "PAXOS", "PAXOI"] },
  { code: "skiathos", name: { el: "Σκιάθος", en: "Skiathos" }, keywords: ["ΣΚΙΑΘΟΣ", "SKIATHOS"] },
  {
    code: "skopelos",
    name: { el: "Σκόπελος", en: "Skopelos" },
    keywords: ["ΣΚΟΠΕΛΟΣ", "SKOPELOS"],
  },
  {
    code: "thassos",
    name: { el: "Θάσος", en: "Thassos" },
    keywords: ["ΘΑΣΟΣ", "THASSOS", "THASOS"],
  },
  {
    code: "halkidiki",
    name: { el: "Χαλκιδική", en: "Halkidiki" },
    keywords: ["ΧΑΛΚΙΔΙΚΗ", "HALKIDIKI", "CHALKIDIKI"],
  },
  { code: "samos", name: { el: "Σάμος", en: "Samos" }, keywords: ["ΣΑΜΟΣ", "SAMOS"] },
  {
    code: "lesvos",
    name: { el: "Λέσβος", en: "Lesvos" },
    keywords: ["ΛΕΣΒΟΣ", "LESVOS", "LESBOS"],
  },
  { code: "chios", name: { el: "Χίος", en: "Chios" }, keywords: ["ΧΙΟΣ", "CHIOS"] },
  {
    code: "karpathos",
    name: { el: "Κάρπαθος", en: "Karpathos" },
    keywords: ["ΚΑΡΠΑΘΟΣ", "KARPATHOS"],
  },
  { code: "hydra", name: { el: "Ύδρα", en: "Hydra" }, keywords: ["ΥΔΡΑ", "HYDRA"] },
  { code: "aegina", name: { el: "Αίγινα", en: "Aegina" }, keywords: ["ΑΙΓΙΝΑ", "AEGINA"] },
  { code: "nafplio", name: { el: "Ναύπλιο", en: "Nafplio" }, keywords: ["ΝΑΥΠΛΙΟ", "NAFPLIO"] },
  { code: "meteora", name: { el: "Μετέωρα", en: "Meteora" }, keywords: ["ΜΕΤΕΩΡΑ", "METEORA"] },
];

/** Upper-case, without accents/diaeresis: "Τζόκεϊ" → "ΤΖΟΚΕΙ". */
export function normalizeForMatching(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleUpperCase("el");
}

const destinationByKeyword = new Map(
  DESTINATIONS.flatMap((d) => d.keywords.map((k) => [normalizeForMatching(k), d] as const))
);

/** Destinations named in a product name (whole words), in list order, without duplicates. */
export function detectDestinations(productName: string): Destination[] {
  const words = normalizeForMatching(productName).split(/[^\p{L}]+/u);
  const found = new Set(words.map((w) => destinationByKeyword.get(w)).filter((d) => d != null));
  return DESTINATIONS.filter((d) => found.has(d));
}
