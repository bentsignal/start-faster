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
  all: ["cart", "mutation"] as const,
  lineAll: ["cart", "mutation", "line"] as const,
  lineAdd: ["cart", "mutation", "line", "add"] as const,
  lineRemove: ["cart", "mutation", "line", "remove"] as const,
  lineUpdate: ["cart", "mutation", "line", "update"] as const,
};
