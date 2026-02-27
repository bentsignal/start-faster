import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";

import type {
  CartByIdQuery,
  CartCreateForCartMutation,
  CartLinesAddForCartMutation,
  CartLinesRemoveForCartMutation,
  CartLinesUpdateForCartMutation,
} from "@acme/shopify/storefront/generated";
import {
  cartById,
  cartCreateForCart,
  cartLinesAddForCart,
  cartLinesRemoveForCart,
  cartLinesUpdateForCart,
} from "@acme/shopify/storefront/cart";

import type { Cart } from "~/features/cart/types";
import { shopify } from "~/lib/shopify";

type CartSource =
  | CartByIdQuery["cart"]
  | NonNullable<CartCreateForCartMutation["cartCreate"]>["cart"]
  | NonNullable<CartLinesAddForCartMutation["cartLinesAdd"]>["cart"]
  | NonNullable<CartLinesUpdateForCartMutation["cartLinesUpdate"]>["cart"]
  | NonNullable<CartLinesRemoveForCartMutation["cartLinesRemove"]>["cart"];

interface ShopifyUserError {
  message: string;
}

const cartIdSchema = z.string().min(1);
const quantitySchema = z.number().int().positive();

function normalizeAmount(amount: number | string) {
  return typeof amount === "number" ? amount : Number(amount);
}

function normalizeCart(cart: CartSource | null | undefined): Cart | null {
  if (cart === null || cart === undefined) {
    return null;
  }

  const lines = cart.lines.nodes.flatMap((line) => {
    const merchandise = line.merchandise;
    const image = merchandise.image;

    return [
      {
        id: line.id,
        quantity: line.quantity,
        cost: {
          amountPerQuantity: {
            amount: normalizeAmount(line.cost.amountPerQuantity.amount),
            currencyCode: line.cost.amountPerQuantity.currencyCode,
          },
          subtotalAmount: {
            amount: normalizeAmount(line.cost.subtotalAmount.amount),
            currencyCode: line.cost.subtotalAmount.currencyCode,
          },
          totalAmount: {
            amount: normalizeAmount(line.cost.totalAmount.amount),
            currencyCode: line.cost.totalAmount.currencyCode,
          },
        },
        merchandise: {
          id: merchandise.id,
          title: merchandise.title,
          image:
            image === null || image === undefined
              ? null
              : {
                  url: image.url,
                  altText: image.altText ?? null,
                  width: image.width ?? null,
                  height: image.height ?? null,
                },
          product: {
            title: merchandise.product.title,
            handle: merchandise.product.handle,
          },
          selectedOptions: merchandise.selectedOptions.map(
            (selectedOption) => ({
              name: selectedOption.name,
              value: selectedOption.value,
            }),
          ),
        },
      },
    ];
  });

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: {
      totalAmount: {
        amount: normalizeAmount(cart.cost.totalAmount.amount),
        currencyCode: cart.cost.totalAmount.currencyCode,
      },
    },
    lines,
  };
}

function getUserErrorMessage(
  userErrors: readonly ShopifyUserError[],
  fallbackMessage: string,
) {
  const [firstError] = userErrors;
  if (firstError === undefined) {
    return fallbackMessage;
  }

  return firstError.message;
}

function hasRecoverableMissingCartError(
  userErrors: readonly ShopifyUserError[],
) {
  return userErrors.some((error) => {
    const normalizedMessage = error.message.toLowerCase();
    return (
      normalizedMessage.includes("cart") &&
      (normalizedMessage.includes("exist") ||
        normalizedMessage.includes("invalid") ||
        normalizedMessage.includes("not found"))
    );
  });
}

function assertNoUserErrors(
  userErrors: readonly ShopifyUserError[],
  contextMessage: string,
) {
  if (userErrors.length === 0) {
    return;
  }

  throw new Error(getUserErrorMessage(userErrors, contextMessage));
}

export const getCartFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      cartId: cartIdSchema,
    }),
  )
  .handler(async ({ data }) => {
    const response = await shopify.request(cartById, {
      variables: {
        id: data.cartId,
      },
    });

    return normalizeCart(response.data?.cart);
  });

export const addCartLineFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      cartId: cartIdSchema.optional(),
      merchandiseId: z.string().min(1),
      quantity: quantitySchema.default(1),
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
      const addLineResponse = await shopify.request(cartLinesAddForCart, {
        variables: {
          cartId: data.cartId,
          lines,
        },
      });

      const existingPayload = addLineResponse.data?.cartLinesAdd;
      if (existingPayload !== null && existingPayload !== undefined) {
        if (
          hasRecoverableMissingCartError(existingPayload.userErrors) === false
        ) {
          assertNoUserErrors(
            existingPayload.userErrors,
            "Unable to add item to your cart.",
          );
        }

        const existingCart = normalizeCart(existingPayload.cart);
        if (existingCart !== null) {
          return existingCart;
        }
      }
    }

    const createCartResponse = await shopify.request(cartCreateForCart, {
      variables: {
        lines,
      },
    });

    const newPayload = createCartResponse.data?.cartCreate;
    if (newPayload === null || newPayload === undefined) {
      throw new Error("Unable to create Shopify cart.");
    }

    assertNoUserErrors(newPayload.userErrors, "Unable to create Shopify cart.");

    const newCart = normalizeCart(newPayload.cart);
    if (newCart === null) {
      throw new Error("Unable to create Shopify cart.");
    }

    return newCart;
  });

export const updateCartLineFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      cartId: cartIdSchema,
      lineId: z.string().min(1),
      quantity: quantitySchema,
    }),
  )
  .handler(async ({ data }) => {
    const response = await shopify.request(cartLinesUpdateForCart, {
      variables: {
        cartId: data.cartId,
        lines: [
          {
            id: data.lineId,
            quantity: data.quantity,
          },
        ],
      },
    });

    const payload = response.data?.cartLinesUpdate;
    if (payload === null || payload === undefined) {
      throw new Error("Unable to update Shopify cart line.");
    }

    assertNoUserErrors(payload.userErrors, "Unable to update cart quantity.");

    const updatedCart = normalizeCart(payload.cart);
    if (updatedCart === null) {
      throw new Error("Unable to update Shopify cart line.");
    }

    return updatedCart;
  });

export const removeCartLineFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      cartId: cartIdSchema,
      lineId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const response = await shopify.request(cartLinesRemoveForCart, {
      variables: {
        cartId: data.cartId,
        lineIds: [data.lineId],
      },
    });

    const payload = response.data?.cartLinesRemove;
    if (payload === null || payload === undefined) {
      throw new Error("Unable to remove Shopify cart line.");
    }

    assertNoUserErrors(payload.userErrors, "Unable to remove cart line.");

    const updatedCart = normalizeCart(payload.cart);
    if (updatedCart === null) {
      throw new Error("Unable to remove Shopify cart line.");
    }

    return updatedCart;
  });
