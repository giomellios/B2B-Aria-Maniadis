import { graphql } from "@/lib/api/graphql";

export const GetActiveOrderQuery = graphql(`
  query GetActiveOrder {
    activeOrder {
      id
      code
      state
      totalQuantity
      subTotal
      subTotalWithTax
      shipping
      shippingWithTax
      total
      totalWithTax
      currencyCode
      couponCodes
      discounts {
        description
        amountWithTax
      }
      lines {
        id
        productVariant {
          id
          name
          sku
          featuredAsset {
            id
            preview
          }
          product {
            id
            name
            slug
            featuredAsset {
              id
              preview
            }
          }
        }
        unitPriceWithTax
        quantity
        linePriceWithTax
      }
    }
  }
`);

/** Quick order: does a product exist whose slug is this catalogue code (A1034 → "a1034")? */
export const ProductByCodeQuery = graphql(`
  query ProductByCode($slug: String!) {
    product(slug: $slug) {
      slug
    }
  }
`);
