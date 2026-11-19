import { LanguageCode, PluginCommonModule, VendurePlugin } from "@vendure/core";

import { FacetCommentOrderInterceptor } from "./config/facet-comment-order-interceptor";
import { MAX_COMMENT_LENGTH } from "./constants";
import "./types";

/**
 * Customer comments driven by facets.
 *
 * - The admin marks a facet value (e.g. characteristic "Κέντημα") as asking for a comment, optionally
 *   required, with the question to ask (FacetValue custom fields, edited in the Dashboard).
 * - Every variant tagged with that value — directly or through its product — then shows a comment
 *   box on the storefront; the answer is stored on the order line (OrderLine.customFields.comment)
 *   and shown on the order in the Dashboard.
 * - FacetCommentOrderInterceptor refuses Shop API lines that miss a required comment.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  compatibility: "^3.0.0",
  dashboard: "./dashboard/index.tsx",
  configuration: (config) => {
    config.customFields.FacetValue.push(
      {
        name: "commentEnabled",
        type: "boolean",
        defaultValue: false,
        nullable: false,
        public: true,
        label: [
          { languageCode: LanguageCode.en, value: "Ask the customer for a comment" },
          { languageCode: LanguageCode.el, value: "Ζητά σχόλιο από τον πελάτη" },
        ],
        description: [
          {
            languageCode: LanguageCode.en,
            value:
              "Products and variants with this value show a comment box on the storefront when ordered (e.g. embroidery text).",
          },
          {
            languageCode: LanguageCode.el,
            value:
              "Τα προϊόντα και οι παραλλαγές με αυτή την τιμή εμφανίζουν πεδίο σχολίου στο κατάστημα κατά την παραγγελία (π.χ. κείμενο κεντήματος).",
          },
        ],
      },
      {
        name: "commentRequired",
        type: "boolean",
        defaultValue: false,
        nullable: false,
        public: true,
        label: [
          { languageCode: LanguageCode.en, value: "Comment is required" },
          { languageCode: LanguageCode.el, value: "Το σχόλιο είναι υποχρεωτικό" },
        ],
        description: [
          {
            languageCode: LanguageCode.en,
            value: "The item cannot be added to the order without a comment.",
          },
          {
            languageCode: LanguageCode.el,
            value: "Το είδος δεν μπαίνει στην παραγγελία χωρίς σχόλιο.",
          },
        ],
      },
      {
        name: "commentLabel",
        type: "localeString",
        nullable: true,
        public: true,
        label: [
          { languageCode: LanguageCode.en, value: "Comment question" },
          { languageCode: LanguageCode.el, value: "Ερώτηση σχολίου" },
        ],
        description: [
          {
            languageCode: LanguageCode.en,
            value:
              'What the customer is asked, e.g. "Embroidery text or logo". Defaults to the value name.',
          },
          {
            languageCode: LanguageCode.el,
            value:
              "Τι ρωτάμε τον πελάτη, π.χ. «Κείμενο ή λογότυπο κεντήματος». Αν μείνει κενό, εμφανίζεται το όνομα της τιμής.",
          },
        ],
      },
      {
        name: "commentPlaceholder",
        type: "localeString",
        nullable: true,
        public: true,
        label: [
          { languageCode: LanguageCode.en, value: "Comment example text" },
          { languageCode: LanguageCode.el, value: "Παράδειγμα σχολίου" },
        ],
        description: [
          {
            languageCode: LanguageCode.en,
            value: "Hint shown inside the empty comment box.",
          },
          {
            languageCode: LanguageCode.el,
            value: "Βοηθητικό κείμενο μέσα στο κενό πεδίο σχολίου.",
          },
        ],
      }
    );

    config.customFields.OrderLine.push({
      name: "comment",
      type: "text",
      nullable: true,
      public: true,
      label: [
        { languageCode: LanguageCode.en, value: "Customer comment" },
        { languageCode: LanguageCode.el, value: "Σχόλιο πελάτη" },
      ],
      validate: (value: string | null | undefined) => {
        if (value && value.length > MAX_COMMENT_LENGTH) {
          return [
            {
              languageCode: LanguageCode.en,
              value: `The comment can be at most ${MAX_COMMENT_LENGTH} characters long.`,
            },
            {
              languageCode: LanguageCode.el,
              value: `Το σχόλιο μπορεί να έχει έως ${MAX_COMMENT_LENGTH} χαρακτήρες.`,
            },
          ];
        }
      },
    });

    config.orderOptions.orderInterceptors.push(new FacetCommentOrderInterceptor());
    return config;
  },
})
export class FacetCommentsPlugin {}
