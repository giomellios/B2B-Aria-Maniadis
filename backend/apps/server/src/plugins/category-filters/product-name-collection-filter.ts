import { CollectionFilter, combineWithAndArg, LanguageCode } from "@vendure/core";

let paramCounter = 0;

/** Escapes LIKE wildcards so "100%" matches literally. */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Collection filter: "product name contains any of …" (comma-separated, case-insensitive).
 * E.g. a "Καπέλα" category with `ΚΑΠΕΛΟ, ΤΖΟΚΕ, ΚΩΝΟΣ, ΣΚΙΑΣΤΡ`.
 *
 * Use this instead of Vendure's built-in "variant name" filter: our variants have a Greek and an
 * English translation with the same name, so that filter returns every variant twice and the
 * collection update fails on a duplicate key (the collection silently stays empty). This filter
 * uses a sub-query, so each variant appears once. Postgres only (ILIKE, quoted column names).
 */
export const productNameCollectionFilter = new CollectionFilter({
  code: "product-name-contains",
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Product name contains any of the terms",
    },
    {
      languageCode: LanguageCode.el,
      value: "Το όνομα του προϊόντος περιέχει κάποιον από τους όρους",
    },
  ],
  args: {
    terms: {
      type: "string",
      label: [
        { languageCode: LanguageCode.en, value: "Terms (comma-separated)" },
        { languageCode: LanguageCode.el, value: "Όροι (χωρισμένοι με κόμμα)" },
      ],
      description: [
        {
          languageCode: LanguageCode.en,
          value:
            "Case-insensitive, e.g. “ΚΑΠΕΛΟ, ΤΖΟΚΕ”. Matches products whose name contains any term.",
        },
        {
          languageCode: LanguageCode.el,
          value:
            "Χωρίς διάκριση πεζών/κεφαλαίων, π.χ. «ΚΑΠΕΛΟ, ΤΖΟΚΕ». Ταιριάζει προϊόντα που το όνομά τους περιέχει κάποιον όρο.",
        },
      ],
    },
    combineWithAnd: combineWithAndArg,
  },
  apply: (qb, args) => {
    const terms = String(args.terms ?? "")
      .split(",")
      .map((term) => term.trim())
      .filter(Boolean);
    if (!terms.length) {
      return qb.andWhere("1 = 0");
    }
    const params: Record<string, string> = {};
    const conditions = terms.map((term) => {
      const name = `productNameTerm${++paramCounter}`;
      params[name] = `%${escapeLike(term)}%`;
      return `pnt.name ILIKE :${name}`;
    });
    const clause = `productVariant.productId IN (SELECT pnt."baseId" FROM product_translation pnt WHERE ${conditions.join(" OR ")})`;
    return args.combineWithAnd === false ? qb.orWhere(clause, params) : qb.andWhere(clause, params);
  },
});
