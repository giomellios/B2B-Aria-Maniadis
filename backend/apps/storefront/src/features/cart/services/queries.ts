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
