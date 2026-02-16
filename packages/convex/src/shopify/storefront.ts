"use node";

import { createClient } from "./genql/storefront";
import { getShopifyStorefrontConfig } from "./config";
import type { ShopifyCartLineInput } from "./types";

const storefrontClient = () => {
  const config = getShopifyStorefrontConfig();
  return createClient({
    url: `https://${config.domain}/api/${config.apiVersion}/graphql.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.accessToken,
    },
  });
};

interface CartCreateResult {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: { field?: string[] | null; message: string }[];
    warnings: { code: string; message: string }[];
  };
}

export const parseCheckoutResult = (result: CartCreateResult) => {
  const errorMessage =
    result.cartCreate.userErrors.length > 0
      ? result.cartCreate.userErrors.map((error) => error.message).join("; ")
      : null;
  if (!result.cartCreate.cart || errorMessage) {
    throw new Error(errorMessage ?? "Shopify cart creation failed");
  }
  return {
    cartId: result.cartCreate.cart.id,
    checkoutUrl: result.cartCreate.cart.checkoutUrl,
    warnings: result.cartCreate.warnings.map((warning) => ({
      code: warning.code,
      message: warning.message,
    })),
  };
};

export const createCheckoutFromLines = async (args: {
  lines: ShopifyCartLineInput[];
}) => {
  const client = storefrontClient();
  const result = await client.mutation({
    cartCreate: {
      __args: {
        input: {
          lines: args.lines.map((line) => ({
            merchandiseId: line.merchandiseId,
            quantity: line.quantity,
          })),
        },
      },
      cart: {
        id: true,
        checkoutUrl: true,
      },
      userErrors: {
        field: true,
        message: true,
      },
      warnings: {
        code: true,
        message: true,
      },
    },
  });

  return parseCheckoutResult(result);
};
