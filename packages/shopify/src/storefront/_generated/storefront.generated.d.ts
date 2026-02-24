/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.d.ts';

export type ProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type ProductByHandleQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description'>
    & { options: Array<Pick<StorefrontTypes.ProductOption, 'name' | 'values'>>, images: { nodes: Array<Pick<StorefrontTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { nodes: Array<(
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
        & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
      )> } }
  )> };

export type GetQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  first: StorefrontTypes.Scalars['Int']['input'];
}>;


export type GetQuery = { collection?: StorefrontTypes.Maybe<{ products: { nodes: Array<(
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
      )> } }> };

interface GeneratedQueryTypes {
  "#graphql\n  query ProductByHandle($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      description\n      options {\n        name\n        values\n      }\n      images(first: 50) {\n        nodes {\n          id\n          url\n          altText\n          width\n          height\n        }\n      }\n      featuredImage {\n        url\n        altText\n      }\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      variants(first: 100) {\n        nodes {\n          id\n          title\n          availableForSale\n          price {\n            amount\n            currencyCode\n          }\n          selectedOptions {\n            name\n            value\n          }\n        }\n      }\n    }\n  }\n": {return: ProductByHandleQuery, variables: ProductByHandleQueryVariables},
  "#graphql\n  query get($handle: String!, $first: Int!) {\n    collection(handle: $handle) {\n      products(first: $first) {\n        nodes {\n          id\n          title\n          handle\n          featuredImage {\n            url\n            altText\n          }\n          priceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: GetQuery, variables: GetQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
