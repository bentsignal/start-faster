export const getProductsByIds = `#graphql
  query GetProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on Product {
        id
        handle
        title
        variants(first: 100) {
          nodes {
            id
          }
        }
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
