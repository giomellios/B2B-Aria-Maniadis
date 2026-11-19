/**
 * Facet-driven order comments (server: FacetCommentsPlugin). An admin marks a facet value — e.g.
 * the characteristic "Κέντημα" — as asking for a comment; every variant tagged with it, directly or
 * through its product, then gets a comment box, and the answer is stored on the order line.
 */

/** Must match MAX_COMMENT_LENGTH in the server's facet-comments plugin. */
export const MAX_COMMENT_LENGTH = 1000;

export interface FacetValueWithComment {
  id: string;
  name: string;
  customFields?: {
    commentEnabled?: boolean | null;
    commentRequired?: boolean | null;
    commentLabel?: string | null;
    commentPlaceholder?: string | null;
  } | null;
}

export interface CommentField {
  /** Same key ⇔ same question: the matrix asks once for all the cells that share it. */
  key: string;
  label: string;
  placeholder?: string;
  required: boolean;
}

/** The comment a variant asks for, or null when none of its facet values ask for one. */
export function commentFieldFor(
  variantFacetValues: readonly FacetValueWithComment[] = [],
  productFacetValues: readonly FacetValueWithComment[] = []
): CommentField | null {
  const all = [...variantFacetValues, ...productFacetValues];
  const enabled = all
    .filter((fv, index) => all.findIndex((other) => other.id === fv.id) === index)
    .filter((fv) => fv.customFields?.commentEnabled)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (enabled.length === 0) return null;

  const placeholders = enabled
    .map((fv) => fv.customFields?.commentPlaceholder?.trim())
    .filter((text): text is string => Boolean(text));
  return {
    key: enabled.map((fv) => fv.id).join(","),
    label: enabled.map((fv) => fv.customFields?.commentLabel?.trim() || fv.name).join(" / "),
    placeholder: placeholders.length > 0 ? placeholders.join(" / ") : undefined,
    required: enabled.some((fv) => fv.customFields?.commentRequired),
  };
}
