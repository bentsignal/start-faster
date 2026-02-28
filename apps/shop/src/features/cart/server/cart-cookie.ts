import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import {
  CART_ID_COOKIE_KEY,
  CART_QUANTITY_COOKIE_KEY,
} from "~/features/cart/lib/cart-id";

export interface CartCookieState {
  id: string | null;
  quantity: number;
}

export const getCartFromCookie = createServerFn({ method: "GET" }).handler(
  (): CartCookieState => {
    const cartIdCookie = getCookie(CART_ID_COOKIE_KEY);
    const cartQuantityCookie = getCookie(CART_QUANTITY_COOKIE_KEY);

    const id =
      cartIdCookie === undefined || cartIdCookie.length === 0
        ? null
        : cartIdCookie;

    if (cartQuantityCookie === undefined || cartQuantityCookie.length === 0) {
      return {
        id,
        quantity: 0,
      };
    }

    const parsedQuantity = Number.parseInt(cartQuantityCookie, 10);
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      return {
        id,
        quantity: 0,
      };
    }

    return {
      id,
      quantity: parsedQuantity,
    };
  },
);
