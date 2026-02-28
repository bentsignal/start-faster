import { getCartFn } from "~/features/cart/server/manage-cart";
import { getCartFromCookie } from "../server/cart-cookie";

export const cartQueries = {
  all: () => ({
    queryKey: ["cart"] as const,
  }),
  cookie: () => ({
    queryKey: [...cartQueries.all().queryKey, "cookie"] as const,
    queryFn: getCartFromCookie,
    staleTime: Infinity,
    gcTime: Infinity,
  }),
  detailAll: () => ({
    queryKey: [...cartQueries.all().queryKey, "detail"] as const,
  }),
  detail: (cartId: string | null) => ({
    queryKey: [...cartQueries.detailAll().queryKey, cartId] as const,
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

export const cartMutationKeys = {
  all: [cartQueries.all().queryKey, "mutation"] as const,
  lineAll: [cartQueries.all().queryKey, "mutation", "line"] as const,
  lineAdd: [cartQueries.all().queryKey, "mutation", "line", "add"] as const,
  lineRemove: [
    cartQueries.all().queryKey,
    "mutation",
    "line",
    "remove",
  ] as const,
  lineUpdate: [
    cartQueries.all().queryKey,
    "mutation",
    "line",
    "update",
  ] as const,
};
