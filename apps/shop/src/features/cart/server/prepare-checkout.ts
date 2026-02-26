import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";

import {
  cartCreateForCheckout,
  cartLinesAddForCheckout,
} from "@acme/shopify/storefront/cart";

import { shopify } from "~/lib/shopify";

export const prepareCheckoutFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      cartId: z.string().optional(),
      merchandiseId: z.string(),
      quantity: z.number().int().positive().default(1),
    }),
  )
  .handler(async ({ data }) => {
    const lines = [
      {
        merchandiseId: data.merchandiseId,
        quantity: data.quantity,
      },
    ];

    if (data.cartId !== undefined) {
      const addLineResponse = await shopify.request(cartLinesAddForCheckout, {
        variables: {
          cartId: data.cartId,
          lines,
        },
      });

      const existingCart = addLineResponse.data?.cartLinesAdd?.cart;
      if (existingCart !== null && existingCart !== undefined) {
        return existingCart;
      }
    }

    const createCartResponse = await shopify.request(cartCreateForCheckout, {
      variables: {
        lines,
      },
    });

    const newCart = createCartResponse.data?.cartCreate?.cart;
    if (newCart === null || newCart === undefined) {
      throw new Error("Unable to create Shopify cart for checkout.");
    }

    return newCart;
  });
