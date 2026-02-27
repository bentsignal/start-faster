export const cartById = `#graphql
  query CartById($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }

  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        ...CartLineFields
      }
    }
  }

  fragment CartLineFields on BaseCartLine {
    id
    quantity
    cost {
      amountPerQuantity {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        image {
          url
          altText
          width
          height
        }
        product {
          title
          handle
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const cartCreateForCart = `#graphql
  mutation CartCreateForCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      userErrors {
        field
        message
      }
      cart {
        ...CartFields
      }
    }
  }

  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        ...CartLineFields
      }
    }
  }

  fragment CartLineFields on BaseCartLine {
    id
    quantity
    cost {
      amountPerQuantity {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        image {
          url
          altText
          width
          height
        }
        product {
          title
          handle
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const cartLinesAddForCart = `#graphql
  mutation CartLinesAddForCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      userErrors {
        field
        message
      }
      cart {
        ...CartFields
      }
    }
  }

  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        ...CartLineFields
      }
    }
  }

  fragment CartLineFields on BaseCartLine {
    id
    quantity
    cost {
      amountPerQuantity {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        image {
          url
          altText
          width
          height
        }
        product {
          title
          handle
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const cartLinesUpdateForCart = `#graphql
  mutation CartLinesUpdateForCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      userErrors {
        field
        message
      }
      cart {
        ...CartFields
      }
    }
  }

  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        ...CartLineFields
      }
    }
  }

  fragment CartLineFields on BaseCartLine {
    id
    quantity
    cost {
      amountPerQuantity {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        image {
          url
          altText
          width
          height
        }
        product {
          title
          handle
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const cartLinesRemoveForCart = `#graphql
  mutation CartLinesRemoveForCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      userErrors {
        field
        message
      }
      cart {
        ...CartFields
      }
    }
  }

  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        ...CartLineFields
      }
    }
  }

  fragment CartLineFields on BaseCartLine {
    id
    quantity
    cost {
      amountPerQuantity {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        image {
          url
          altText
          width
          height
        }
        product {
          title
          handle
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;
