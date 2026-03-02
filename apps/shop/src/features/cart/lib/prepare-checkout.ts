import {
  cartCreateForCheckout,
  cartLinesAddForCheckout,
} from "@acme/shopify/storefront/cart";

import { shopify } from "~/lib/shopify";

function assertNonEmptyValue(value: string, fieldName: string) {
  if (value.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }
}

function assertPositiveInteger(value: number, fieldName: string) {
  if (Number.isInteger(value) === false || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
}

export async function prepareCheckoutFn({
  data,
}: {
  data: {
    cartId?: string;
    merchandiseId: string;
    quantity: number;
  };
}) {
  assertNonEmptyValue(data.merchandiseId, "merchandiseId");
  assertPositiveInteger(data.quantity, "quantity");

  const lines = [
    {
      merchandiseId: data.merchandiseId,
      quantity: data.quantity,
    },
  ];

  if (data.cartId !== undefined) {
    assertNonEmptyValue(data.cartId, "cartId");

    const addLineResponse = await shopify.request(cartLinesAddForCheckout, {
      variables: {
        cartId: data.cartId,
        lines,
      },
    });

    const existingCart = addLineResponse.data?.cartLinesAdd?.cart;
    if (existingCart !== null && existingCart !== undefined) {
      return existingCart;
    }
  }

  const createCartResponse = await shopify.request(cartCreateForCheckout, {
    variables: {
      lines,
    },
  });

  const newCart = createCartResponse.data?.cartCreate?.cart;
  if (newCart === null || newCart === undefined) {
    throw new Error("Unable to create Shopify cart for checkout.");
  }

  return newCart;
}
