export const listProductHandles = `#graphql
  query ListProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        handle
        updatedAt
        featuredImage {
          url
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
