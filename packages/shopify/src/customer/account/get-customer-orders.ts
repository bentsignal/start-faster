export const getCustomerOrders = `#graphql
  query GetCustomerOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after, reverse: true) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          number
          processedAt
          fulfillmentStatus
          financialStatus
          totalPrice {
            amount
            currencyCode
          }
          fulfillments(first: 10) {
            nodes {
              id
              latestShipmentStatus
              trackingInformation {
                company
                number
                url
              }
            }
          }
          lineItems(first: 50) {
            nodes {
              id
              title
              variantTitle
              variantId
              quantity
              productId
              image {
                url
                altText
                width
                height
              }
              price {
                amount
                currencyCode
              }
              totalPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;
