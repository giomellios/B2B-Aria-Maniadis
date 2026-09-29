import { graphql } from "@/lib/api/graphql";

export const GetCustomerAddressesQuery = graphql(`
  query GetCustomerAddresses {
    activeCustomer {
      id
      addresses {
        id
        fullName
        company
        streetLine1
        streetLine2
        city
        province
        postalCode
        country {
          id
          code
          name
        }
        phoneNumber
        defaultShippingAddress
        defaultBillingAddress
      }
    }
  }
`);

export const GetCustomerOrdersQuery = graphql(`
  query GetCustomerOrders($options: OrderListOptions) {
    activeCustomer {
      id
      orders(options: $options) {
        totalItems
        items {
          id
          code
          state
          totalWithTax
          currencyCode
          createdAt
          updatedAt
          lines {
            id
            productVariant {
              id
              name
              product {
                id
                name
                featuredAsset {
                  id
                  preview
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const GetOrderDetailQuery = graphql(`
  query GetOrderDetail($code: String!) {
    orderByCode(code: $code) {
      id
      code
      state
      active
      createdAt
      updatedAt
      totalQuantity
      subTotal
      subTotalWithTax
      shipping
      shippingWithTax
      total
      totalWithTax
      currencyCode
      customer {
        id
        firstName
        lastName
        emailAddress
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
      payments {
        id
        method
        amount
        state
        transactionId
        createdAt
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
      discounts {
        description
        amountWithTax
      }
    }
  }
`);
