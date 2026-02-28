import { getCartFn } from "~/features/cart/server/manage-cart";

export const cartQueries = {
  all: () => ({
    queryKey: ["cart"] as const,
  }),
  detail: (cartId: string | null) => ({
    queryKey: [...cartQueries.all().queryKey, cartId] as const,
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
  }),
};
