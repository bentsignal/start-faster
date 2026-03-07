/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as CustomerTypes from './customer.types.d.ts';

export type GetCustomerIdentityQueryVariables = CustomerTypes.Exact<{ [key: string]: never; }>;


export type GetCustomerIdentityQuery = { customer: (
    Pick<CustomerTypes.Customer, 'id' | 'firstName' | 'lastName'>
    & { emailAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerEmailAddress, 'emailAddress'>> }
  ) };

export type GetCustomerOrdersQueryVariables = CustomerTypes.Exact<{
  first: CustomerTypes.Scalars['Int']['input'];
  after?: CustomerTypes.InputMaybe<CustomerTypes.Scalars['String']['input']>;
}>;


export type GetCustomerOrdersQuery = { customer: { orders: { pageInfo: Pick<CustomerTypes.PageInfo, 'hasNextPage' | 'endCursor'>, nodes: Array<(
        Pick<CustomerTypes.Order, 'id' | 'name' | 'number' | 'processedAt' | 'fulfillmentStatus' | 'financialStatus'>
        & { totalPrice: Pick<CustomerTypes.MoneyV2, 'amount' | 'currencyCode'>, fulfillments: { nodes: Array<(
            Pick<CustomerTypes.Fulfillment, 'id'>
            & { trackingInformation: Array<Pick<CustomerTypes.TrackingInformation, 'company' | 'number' | 'url'>> }
          )> }, lineItems: { nodes: Array<(
            Pick<CustomerTypes.LineItem, 'id' | 'title' | 'variantTitle' | 'variantId' | 'quantity' | 'vendor' | 'productId'>
            & { image?: CustomerTypes.Maybe<Pick<CustomerTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, price?: CustomerTypes.Maybe<Pick<CustomerTypes.MoneyV2, 'amount' | 'currencyCode'>>, totalPrice?: CustomerTypes.Maybe<Pick<CustomerTypes.MoneyV2, 'amount' | 'currencyCode'>> }
          )> } }
      )> } } };

interface GeneratedQueryTypes {
  "#graphql\n  query GetCustomerIdentity {\n    customer {\n      id\n      emailAddress {\n        emailAddress\n      }\n      firstName\n      lastName\n    }\n  }\n": {return: GetCustomerIdentityQuery, variables: GetCustomerIdentityQueryVariables},
  "#graphql\n  query GetCustomerOrders($first: Int!, $after: String) {\n    customer {\n      orders(first: $first, after: $after, reverse: true) {\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          number\n          processedAt\n          fulfillmentStatus\n          financialStatus\n          totalPrice {\n            amount\n            currencyCode\n          }\n          fulfillments(first: 10) {\n            nodes {\n              id\n              trackingInformation {\n                company\n                number\n                url\n              }\n            }\n          }\n          lineItems(first: 50) {\n            nodes {\n              id\n              title\n              variantTitle\n              variantId\n              quantity\n              vendor\n              productId\n              image {\n                url\n                altText\n                width\n                height\n              }\n              price {\n                amount\n                currencyCode\n              }\n              totalPrice {\n                amount\n                currencyCode\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: GetCustomerOrdersQuery, variables: GetCustomerOrdersQueryVariables},
}

interface GeneratedMutationTypes {
}

declare module '@shopify/hydrogen' {
  interface CustomerAccountQueries extends GeneratedQueryTypes {}
  interface CustomerAccountMutations extends GeneratedMutationTypes {}
}
