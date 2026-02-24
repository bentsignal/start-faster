/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as CustomerTypes from './customer.types.d.ts';

export type GetCustomerIdentityQueryVariables = CustomerTypes.Exact<{ [key: string]: never; }>;


export type GetCustomerIdentityQuery = { customer: (
    Pick<CustomerTypes.Customer, 'id' | 'firstName' | 'lastName'>
    & { emailAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerEmailAddress, 'emailAddress'>> }
  ) };

interface GeneratedQueryTypes {
  "#graphql\n  query GetCustomerIdentity {\n    customer {\n      id\n      emailAddress {\n        emailAddress\n      }\n      firstName\n      lastName\n    }\n  }\n": {return: GetCustomerIdentityQuery, variables: GetCustomerIdentityQueryVariables},
}

interface GeneratedMutationTypes {
}

declare module '@shopify/hydrogen' {
  interface CustomerAccountQueries extends GeneratedQueryTypes {}
  interface CustomerAccountMutations extends GeneratedMutationTypes {}
}
