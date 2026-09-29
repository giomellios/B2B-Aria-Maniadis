import { graphql } from "@/lib/api/graphql";

export const AddToCartMutation = graphql(`
  mutation AddToCart($variantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $variantId, quantity: $quantity) {
      __typename
      ... on Order {
        id
        code
        totalQuantity
        lines {
          id
          productVariant {
            id
            name
          }
          quantity
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`);

export const RemoveFromCartMutation = graphql(`
  mutation RemoveFromCart($lineId: ID!) {
    removeOrderLine(orderLineId: $lineId) {
      __typename
      ... on Order {
        id
        code
        totalQuantity
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`);

export const AdjustCartItemMutation = graphql(`
  mutation AdjustCartItem($lineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $lineId, quantity: $quantity) {
      __typename
      ... on Order {
        id
        code
        totalQuantity
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`);

export const ApplyPromotionCodeMutation = graphql(`
  mutation ApplyPromotionCode($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      __typename
      ... on Order {
        id
        code
        totalWithTax
        couponCodes
        discounts {
          description
          amountWithTax
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`);

export const RemovePromotionCodeMutation = graphql(`
  mutation RemovePromotionCode($couponCode: String!) {
    removeCouponCode(couponCode: $couponCode) {
      id
      code
      totalWithTax
      couponCodes
      discounts {
        description
        amountWithTax
      }
    }
  }
`);
