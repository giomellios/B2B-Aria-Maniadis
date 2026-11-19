import type {
  CustomFacetValueFields,
  CustomFacetValueFieldsTranslation,
  CustomOrderLineFields,
} from "@vendure/core/dist/entity/custom-entity-fields";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
  interface CustomFacetValueFields {
    /** Variants/products tagged with this value ask the customer for a comment when ordering. */
    commentEnabled: boolean;
    /** The comment must be filled in before the item can be added to the order. */
    commentRequired: boolean;
  }
  interface CustomFacetValueFieldsTranslation {
    /** What the storefront asks for, e.g. "Κείμενο ή λογότυπο για το κέντημα". */
    commentLabel: string | null;
    /** Example text shown inside the empty comment box. */
    commentPlaceholder: string | null;
  }
  interface CustomOrderLineFields {
    /** The customer's comment for the comment-enabled facet values of this line's variant. */
    comment: string | null;
  }
}

export type { CustomFacetValueFields, CustomFacetValueFieldsTranslation, CustomOrderLineFields };
