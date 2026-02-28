import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import { CART_ID_COOKIE_KEY } from "~/features/cart/lib/cart-id";

export const getCartIdFromCookie = createServerFn({ method: "GET" }).handler(
  () => {
    const cartIdCookie = getCookie(CART_ID_COOKIE_KEY);
    return cartIdCookie === undefined || cartIdCookie.length === 0
      ? null
      : cartIdCookie;
  },
);
