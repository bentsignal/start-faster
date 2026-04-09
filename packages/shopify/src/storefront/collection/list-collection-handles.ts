export const listCollectionHandles = `#graphql
  query ListCollectionHandles($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes {
        handle
        updatedAt
        image {
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
