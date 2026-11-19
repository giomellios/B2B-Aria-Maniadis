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
      customFields {
        carrierDetails
      }
      customer {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
        customFields {
          company
        }
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
        customFields {
          comment
        }
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

/** Just the active order's state, for the checkout actions. */
export const GetActiveOrderStateQuery = graphql(`
  query GetActiveOrderState {
    activeOrder {
      id
      state
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
      customFields {
        requiresCarrierDetails
      }
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
      customFields {
        carrierDetails
      }
      lines {
        id
        customFields {
          comment
        }
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
