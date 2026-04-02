import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import {
  CART_ID_COOKIE_KEY,
  CART_QUANTITY_COOKIE_KEY,
} from "~/features/cart/lib/cart-storage";

export type CartCookieState =
  | { id: string; quantity: number }
  | { id: null; quantity: 0 };

export const getCartFromCookie = createServerFn({ method: "GET" }).handler(
  () => {
    const cartIdCookie = getCookie(CART_ID_COOKIE_KEY);
    const cartQuantityCookie = getCookie(CART_QUANTITY_COOKIE_KEY);

    const id =
      cartIdCookie === undefined || cartIdCookie.length === 0
        ? null
        : cartIdCookie;

    if (id === null) {
      return { id: null, quantity: 0 };
    }

    if (cartQuantityCookie === undefined || cartQuantityCookie.length === 0) {
      return { id, quantity: 0 };
    }

    const parsedQuantity = Number.parseInt(cartQuantityCookie, 10);
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      return { id, quantity: 0 };
    }

    return { id, quantity: parsedQuantity };
  },
);
