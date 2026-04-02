import { mutationOptions } from "@tanstack/react-query";

import type { CartLineInput } from "@acme/shopify/storefront/types";
import { cartCreateForCheckout } from "@acme/shopify/storefront/cart";

import { shopify } from "~/lib/shopify";

export const accountMutations = {
  reorder: () =>
    mutationOptions({
      mutationKey: ["account", "reorder"] as const,
      mutationFn: async ({
        orderId,
        lines,
      }: {
        orderId: string;
        lines: CartLineInput[];
      }) => {
        if (lines.length === 0) {
          throw new Error("No reorder lines are available.");
        }

        const response = await shopify.request(cartCreateForCheckout, {
          variables: {
            lines,
          },
        });
        const checkoutCart = response.data?.cartCreate?.cart;

        if (checkoutCart === null || checkoutCart === undefined) {
          throw new Error(
            `Unable to create a reorder checkout for ${orderId}.`,
          );
        }

        return checkoutCart;
      },
    }),
};
