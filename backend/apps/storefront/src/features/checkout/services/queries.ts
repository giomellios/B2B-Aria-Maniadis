import { graphql } from "@/lib/api/graphql";

export const GetActiveOrderForCheckoutQuery = graphql(`
  query GetActiveOrderForCheckout {
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
      customer {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
      }
      shippingAddress {
        fullName
        company
        streetLine1
        streetLine2
        city
        province
        postalCode
        country
        phoneNumber
      }
      billingAddress {
        fullName
        company
        streetLine1
        streetLine2
        city
        province
        postalCode
        country
        phoneNumber
      }
      shippingLines {
        shippingMethod {
          id
          name
          description
        }
        priceWithTax
      }
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

export const GetEligibleShippingMethodsQuery = graphql(`
  query GetEligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      code
      description
      priceWithTax
    }
  }
`);

export const GetEligiblePaymentMethodsQuery = graphql(`
  query GetEligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      name
      code
      description
      isEligible
      eligibilityMessage
    }
  }
`);

export const GetOrderByCodeQuery = graphql(`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      id
      code
      state
      totalWithTax
      currencyCode
      lines {
        id
        productVariant {
          id
          name
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
        quantity
        linePriceWithTax
      }
      shippingAddress {
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        country
      }
    }
  }
`);
