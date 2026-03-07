export const getPredictiveSearch = `#graphql
  query GetPredictiveSearch($query: String!, $limit: Int!) {
    predictiveSearch(
      query: $query
      limit: $limit
      limitScope: EACH
      types: [PRODUCT]
    ) {
      products {
        id
        handle
        title
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
