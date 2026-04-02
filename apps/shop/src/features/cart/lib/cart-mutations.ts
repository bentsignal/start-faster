import { mutationOptions } from "@tanstack/react-query";

import {
  cartLinesRemoveForCart,
  cartLinesUpdateForCart,
} from "@acme/shopify/storefront/cart";

import type { OptimisticCartLineDraft } from "~/features/cart/types";
import { CART_WRITE_SCOPE_ID } from "~/features/cart/hooks/cart-mutation-shared";
import {
  assertNonEmptyValue,
  assertPositiveInteger,
} from "~/features/cart/lib/cart-validation";
import {
  assertNoUserErrors,
  createNewCartWithLines,
  normalizeCart,
  tryAddToExistingCart,
} from "~/features/cart/lib/manage-cart";
import { shopify } from "~/lib/shopify";

export const cartMutations = {
  lineAll: () => ({
    mutationKey: ["cart", "mutation", "line"] as const,
  }),
  lineAdd: () =>
    mutationOptions({
      mutationKey: [...cartMutations.lineAll().mutationKey, "add"] as const,
      scope: {
        id: CART_WRITE_SCOPE_ID,
      },
      mutationFn: async ({
        cartId,
        merchandiseId,
        quantity = 1,
        optimisticLine: _optimisticLine,
      }: {
        cartId?: string;
        merchandiseId: string;
        quantity?: number;
        optimisticLine?: OptimisticCartLineDraft;
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

          const existingCart = await tryAddToExistingCart(cartId, lines);
          if (existingCart !== null) {
            return existingCart;
          }
        }

        return createNewCartWithLines(lines);
      },
    }),
  lineUpdate: () =>
    mutationOptions({
      mutationKey: [...cartMutations.lineAll().mutationKey, "update"] as const,
      scope: {
        id: CART_WRITE_SCOPE_ID,
      },
      mutationFn: async ({
        cartId,
        lineId,
        quantity,
      }: {
        cartId: string;
        lineId: string;
        quantity: number;
      }) => {
        assertNonEmptyValue(cartId, "cartId");
        assertNonEmptyValue(lineId, "lineId");
        assertPositiveInteger(quantity, "quantity");

        const response = await shopify.request(cartLinesUpdateForCart, {
          variables: {
            cartId,
            lines: [
              {
                id: lineId,
                quantity,
              },
            ],
          },
        });

        const payload = response.data?.cartLinesUpdate;
        if (payload === null || payload === undefined) {
          throw new Error("Unable to update Shopify cart line.");
        }

        assertNoUserErrors(
          payload.userErrors,
          "Unable to update cart quantity.",
        );

        const updatedCart = normalizeCart(payload.cart);
        if (updatedCart === null) {
          throw new Error("Unable to update Shopify cart line.");
        }

        return updatedCart;
      },
    }),
  lineRemove: () =>
    mutationOptions({
      mutationKey: [...cartMutations.lineAll().mutationKey, "remove"] as const,
      scope: {
        id: CART_WRITE_SCOPE_ID,
      },
      mutationFn: async ({
        cartId,
        lineId,
      }: {
        cartId: string;
        lineId: string;
      }) => {
        assertNonEmptyValue(cartId, "cartId");
        assertNonEmptyValue(lineId, "lineId");

        const response = await shopify.request(cartLinesRemoveForCart, {
          variables: {
            cartId,
            lineIds: [lineId],
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
      },
    }),
};
