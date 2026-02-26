export const cartLinesAddForCheckout = `#graphql
  mutation CartLinesAddForCheckout($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

export const cartCreateForCheckout = `#graphql
  mutation CartCreateForCheckout($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;
