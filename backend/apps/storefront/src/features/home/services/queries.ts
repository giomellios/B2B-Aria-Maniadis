import { graphql } from "@/lib/api/graphql";

/** Where each product's picture is (product, its gallery, or only on a variant). */
export const ProductImagesQuery = graphql(`
  query FeaturedProductImages($options: ProductListOptions) {
    products(options: $options) {
      totalItems
      items {
        slug
        featuredAsset {
          preview
        }
        assets {
          preview
        }
        variants {
          featuredAsset {
            preview
          }
        }
      }
    }
  }
`);
