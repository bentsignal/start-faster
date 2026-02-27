import { queryOptions } from "@tanstack/react-query";

import { getCartFn } from "~/features/cart/server/manage-cart";

export const cartQueries = {
  all: () =>
    queryOptions({
      queryKey: ["cart"] as const,
    }),
  detail: (cartId: string | null) =>
    queryOptions({
      queryKey: [...cartQueries.all().queryKey, cartId ?? "guest"] as const,
      queryFn: async () => {
        if (cartId === null) {
          return null;
        }

        return getCartFn({
          data: {
            cartId,
          },
        });
      },
      enabled: cartId !== null,
    }),
};
