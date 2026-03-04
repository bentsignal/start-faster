export const searchProducts = `#graphql
  query SearchProducts(
    $query: String!
    $first: Int
    $after: String
    $before: String
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $productFilters: [ProductFilter!]
  ) {
    search(
      query: $query
      first: $first
      after: $after
      before: $before
      sortKey: $sortKey
      reverse: $reverse
      types: [PRODUCT]
      unavailableProducts: LAST
      productFilters: $productFilters
    ) {
      nodes {
        __typename
        ... on Product {
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
          selectedOrFirstAvailableVariant {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
      productFilters {
        id
        label
        type
        presentation
        values {
          id
          label
          count
          input
        }
      }
    }
  }
`;
