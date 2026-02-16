import { v } from "convex/values";

import { action } from "./_generated/server";
import { normalizeCheckoutLines } from "./shopify/checkoutUtils";
import { createCheckoutFromLines } from "./shopify/storefront";

export const createCheckoutUrl = action({
  args: {
    lines: v.array(
      v.object({
        merchandiseId: v.string(),
        quantity: v.number(),
      }),
    ),
  },
  returns: v.object({
    cartId: v.string(),
    checkoutUrl: v.string(),
    warnings: v.array(
      v.object({
        code: v.string(),
        message: v.string(),
      }),
    ),
  }),
  handler: async (_ctx, args) =>
    await createCheckoutFromLines({
      lines: normalizeCheckoutLines(args.lines),
    }),
});
