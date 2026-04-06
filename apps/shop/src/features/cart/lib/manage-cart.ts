import {
  cartCreateForCart,
  cartLinesAddForCart,
} from "@acme/shopify/storefront/cart";

import { shopify } from "~/lib/shopify";

export interface ShopifyUserError {
  message: string;
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

export function assertNoUserErrors(
  userErrors: readonly ShopifyUserError[],
  contextMessage: string,
) {
  if (userErrors.length === 0) {
    return;
  }

  throw new Error(getUserErrorMessage(userErrors, contextMessage));
}

export async function tryAddToExistingCart(
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

  return existingPayload.cart ?? null;
}

export async function createNewCartWithLines(
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

  const newCart = newPayload.cart ?? null;
  if (newCart === null) {
    throw new Error("Unable to create Shopify cart.");
  }

  return newCart;
}
