export const searchCollections = `#graphql
  query SearchCollections($first: Int!, $query: String) {
    collections(first: $first, query: $query) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
        }
      }
    }
  }
`;
