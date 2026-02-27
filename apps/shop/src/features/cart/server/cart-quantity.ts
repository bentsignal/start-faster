import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import { CART_QUANTITY_COOKIE_KEY } from "../lib/cart-id";

export const getCartQuantityFromCookie = createServerFn({
  method: "GET",
}).handler(() => {
  const cartQuantityCookie = getCookie(CART_QUANTITY_COOKIE_KEY);
  if (cartQuantityCookie === undefined || cartQuantityCookie.length === 0) {
    return 0;
  }

  const parsedQuantity = Number.parseInt(cartQuantityCookie, 10);
  if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
    return 0;
  }

  return parsedQuantity;
});
