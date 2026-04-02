import { queryOptions } from "@tanstack/react-query";

import { cartById } from "@acme/shopify/storefront/cart";

import { assertNonEmptyValue } from "~/features/cart/lib/cart-validation";
import { normalizeCart } from "~/features/cart/lib/manage-cart";
import { shopify } from "~/lib/shopify";
import { getCartFromCookie } from "../server/cart-cookie";

export const cartQueries = {
  all: () =>
    queryOptions({
      queryKey: ["cart"] as const,
    }),
  cookie: () =>
    queryOptions({
      queryKey: ["cart", "cookie"] as const,
      queryFn: getCartFromCookie,
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  detailAll: () =>
    queryOptions({
      queryKey: ["cart", "detail"] as const,
    }),
  detail: (cartId: string | null) =>
    queryOptions({
      queryKey: ["cart", "detail", cartId] as const,
      queryFn: async () => {
        if (cartId === null) {
          return null;
        }

        assertNonEmptyValue(cartId, "cartId");

        const response = await shopify.request(cartById, {
          variables: {
            id: cartId,
          },
        });

        return normalizeCart(response.data?.cart);
      },
    }),
};
