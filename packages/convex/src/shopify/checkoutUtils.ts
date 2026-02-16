import type { ShopifyCartLineInput } from "./types";

export const normalizeCheckoutLines = (lines: ShopifyCartLineInput[]) =>
  lines
    .map((line) => ({
      merchandiseId: line.merchandiseId.trim(),
      quantity: Math.max(1, Math.floor(line.quantity)),
    }))
    .filter((line) => line.merchandiseId.length > 0);
