export const getCustomerIdentity = `#graphql
  query GetCustomerIdentity {
    customer {
      id
      emailAddress {
        emailAddress
      }
      firstName
      lastName
    }
  }
`;
