import { cartLinesAddForCheckout } from "@acme/shopify/storefront/cart";

import { shopify } from "~/lib/shopify";

export async function tryPrepareCheckoutForExistingCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
) {
  const addLineResponse = await shopify.request(cartLinesAddForCheckout, {
    variables: {
      cartId,
      lines,
    },
  });

  const existingCart = addLineResponse.data?.cartLinesAdd?.cart;
  if (existingCart === null || existingCart === undefined) {
    return null;
  }

  return existingCart;
}
