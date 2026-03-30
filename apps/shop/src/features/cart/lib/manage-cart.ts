import type {
  CartByIdQuery,
  CartCreateForCartMutation,
  CartLinesAddForCartMutation,
  CartLinesRemoveForCartMutation,
  CartLinesUpdateForCartMutation,
} from "@acme/shopify/storefront/generated";
import {
  cartById,
  cartCreateForCart,
  cartLinesAddForCart,
  cartLinesRemoveForCart,
  cartLinesUpdateForCart,
} from "@acme/shopify/storefront/cart";

import { shopify } from "~/lib/shopify";

type CartSource =
  | CartByIdQuery["cart"]
  | NonNullable<CartCreateForCartMutation["cartCreate"]>["cart"]
  | NonNullable<CartLinesAddForCartMutation["cartLinesAdd"]>["cart"]
  | NonNullable<CartLinesUpdateForCartMutation["cartLinesUpdate"]>["cart"]
  | NonNullable<CartLinesRemoveForCartMutation["cartLinesRemove"]>["cart"];

interface ShopifyUserError {
  message: string;
}

function normalizeCart(cart: CartSource | null | undefined) {
  if (cart === null || cart === undefined) {
    return null;
  }

  return cart;
}

function getUserErrorMessage(
  userErrors: readonly ShopifyUserError[],
  fallbackMessage: string,
) {
  const [firstError] = userErrors;
  if (firstError === undefined) {
    return fallbackMessage;
  }

  return firstError.message;
}

function hasRecoverableMissingCartError(
  userErrors: readonly ShopifyUserError[],
) {
  return userErrors.some((error) => {
    const normalizedMessage = error.message.toLowerCase();
    return (
      normalizedMessage.includes("cart") &&
      (normalizedMessage.includes("exist") ||
        normalizedMessage.includes("invalid") ||
        normalizedMessage.includes("not found"))
    );
  });
}

function assertNoUserErrors(
  userErrors: readonly ShopifyUserError[],
  contextMessage: string,
) {
  if (userErrors.length === 0) {
    return;
  }

  throw new Error(getUserErrorMessage(userErrors, contextMessage));
}

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

export async function getCartFn({ data }: { data: { cartId: string } }) {
  assertNonEmptyValue(data.cartId, "cartId");

  const response = await shopify.request(cartById, {
    variables: {
      id: data.cartId,
    },
  });

  return normalizeCart(response.data?.cart);
}

async function tryAddToExistingCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
) {
  const addLineResponse = await shopify.request(cartLinesAddForCart, {
    variables: {
      cartId,
      lines,
    },
  });

  const existingPayload = addLineResponse.data?.cartLinesAdd;
  if (existingPayload === null || existingPayload === undefined) {
    return null;
  }

  if (hasRecoverableMissingCartError(existingPayload.userErrors) === false) {
    assertNoUserErrors(
      existingPayload.userErrors,
      "Unable to add item to your cart.",
    );
  }

  return normalizeCart(existingPayload.cart);
}

async function createNewCartWithLines(
  lines: { merchandiseId: string; quantity: number }[],
) {
  const createCartResponse = await shopify.request(cartCreateForCart, {
    variables: {
      lines,
    },
  });

  const newPayload = createCartResponse.data?.cartCreate;
  if (newPayload === null || newPayload === undefined) {
    throw new Error("Unable to create Shopify cart.");
  }

  assertNoUserErrors(newPayload.userErrors, "Unable to create Shopify cart.");

  const newCart = normalizeCart(newPayload.cart);
  if (newCart === null) {
    throw new Error("Unable to create Shopify cart.");
  }

  return newCart;
}

export async function addCartLineFn({
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

    const existingCart = await tryAddToExistingCart(data.cartId, lines);
    if (existingCart !== null) {
      return existingCart;
    }
  }

  return createNewCartWithLines(lines);
}

export async function updateCartLineFn({
  data,
}: {
  data: {
    cartId: string;
    lineId: string;
    quantity: number;
  };
}) {
  assertNonEmptyValue(data.cartId, "cartId");
  assertNonEmptyValue(data.lineId, "lineId");
  assertPositiveInteger(data.quantity, "quantity");

  const response = await shopify.request(cartLinesUpdateForCart, {
    variables: {
      cartId: data.cartId,
      lines: [
        {
          id: data.lineId,
          quantity: data.quantity,
        },
      ],
    },
  });

  const payload = response.data?.cartLinesUpdate;
  if (payload === null || payload === undefined) {
    throw new Error("Unable to update Shopify cart line.");
  }

  assertNoUserErrors(payload.userErrors, "Unable to update cart quantity.");

  const updatedCart = normalizeCart(payload.cart);
  if (updatedCart === null) {
    throw new Error("Unable to update Shopify cart line.");
  }

  return updatedCart;
}

export async function removeCartLineFn({
  data,
}: {
  data: {
    cartId: string;
    lineId: string;
  };
}) {
  assertNonEmptyValue(data.cartId, "cartId");
  assertNonEmptyValue(data.lineId, "lineId");

  const response = await shopify.request(cartLinesRemoveForCart, {
    variables: {
      cartId: data.cartId,
      lineIds: [data.lineId],
    },
  });

  const payload = response.data?.cartLinesRemove;
  if (payload === null || payload === undefined) {
    throw new Error("Unable to remove Shopify cart line.");
  }

  assertNoUserErrors(payload.userErrors, "Unable to remove cart line.");

  const updatedCart = normalizeCart(payload.cart);
  if (updatedCart === null) {
    throw new Error("Unable to remove Shopify cart line.");
  }

  return updatedCart;
}
