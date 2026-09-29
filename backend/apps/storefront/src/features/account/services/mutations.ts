import { graphql } from "@/lib/api/graphql";

export const CreateCustomerAddressMutation = graphql(`
  mutation CreateCustomerAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
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
`);

export const UpdateCustomerAddressMutation = graphql(`
  mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
    updateCustomerAddress(input: $input) {
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
`);

export const DeleteCustomerAddressMutation = graphql(`
  mutation DeleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) {
      success
    }
  }
`);

export const UpdateCustomerPasswordMutation = graphql(`
  mutation UpdateCustomerPassword($currentPassword: String!, $newPassword: String!) {
    updateCustomerPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      __typename
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`);

export const UpdateCustomerMutation = graphql(`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      __typename
      id
      firstName
      lastName
      emailAddress
    }
  }
`);

export const RequestUpdateCustomerEmailAddressMutation = graphql(`
  mutation RequestUpdateCustomerEmailAddress($password: String!, $newEmailAddress: String!) {
    requestUpdateCustomerEmailAddress(password: $password, newEmailAddress: $newEmailAddress) {
      __typename
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`);

export const UpdateCustomerEmailAddressMutation = graphql(`
  mutation UpdateCustomerEmailAddress($token: String!) {
    updateCustomerEmailAddress(token: $token) {
      __typename
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`);
