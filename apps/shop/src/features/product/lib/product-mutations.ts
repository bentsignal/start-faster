import { mutationOptions } from "@tanstack/react-query";

import { cartCreateForCheckout } from "@acme/shopify/storefront/cart";

import {
  assertNonEmptyValue,
  assertPositiveInteger,
} from "~/features/cart/lib/cart-validation";
import { tryPrepareCheckoutForExistingCart } from "~/features/cart/lib/prepare-checkout";
import { shopify } from "~/lib/shopify";

export const productMutations = {
  buyNow: () =>
    mutationOptions({
      mutationKey: ["product", "buy-now"] as const,
      mutationFn: async ({
        cartId,
        merchandiseId,
        quantity = 1,
      }: {
        cartId?: string;
        merchandiseId: string;
        quantity?: number;
      }) => {
        assertNonEmptyValue(merchandiseId, "merchandiseId");
        assertPositiveInteger(quantity, "quantity");

        const lines = [
          {
            merchandiseId,
            quantity,
          },
        ];

        if (cartId !== undefined) {
          assertNonEmptyValue(cartId, "cartId");

          const existingCart = await tryPrepareCheckoutForExistingCart(
            cartId,
            lines,
          );
          if (existingCart !== null) {
            return existingCart;
          }
        }

        const createCartResponse = await shopify.request(
          cartCreateForCheckout,
          {
            variables: {
              lines,
            },
          },
        );

        const newCart = createCartResponse.data?.cartCreate?.cart;
        if (newCart === null || newCart === undefined) {
          throw new Error("Unable to create Shopify cart for checkout.");
        }

        return newCart;
      },
    }),
};
