import { describe, expect, it } from "vitest";

import { normalizeCheckoutLines } from "../checkoutUtils";
import { parseCheckoutResult } from "../storefront";

describe("checkout helpers", () => {
  it("normalizes checkout lines", () => {
    expect(
      normalizeCheckoutLines([
        { merchandiseId: " gid://shopify/ProductVariant/1 ", quantity: 0.9 },
        { merchandiseId: "", quantity: 2 },
      ]),
    ).toEqual([{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }]);
  });

  it("parses checkout response", () => {
    expect(
      parseCheckoutResult({
        cartCreate: {
          cart: { id: "gid://shopify/Cart/1", checkoutUrl: "https://checkout" },
          userErrors: [],
          warnings: [{ code: "WARN", message: "warning" }],
        },
      }),
    ).toEqual({
      cartId: "gid://shopify/Cart/1",
      checkoutUrl: "https://checkout",
      warnings: [{ code: "WARN", message: "warning" }],
    });
  });

  it("throws on user errors", () => {
    expect(() =>
      parseCheckoutResult({
        cartCreate: {
          cart: null,
          userErrors: [{ message: "No items" }],
          warnings: [],
        },
      }),
    ).toThrow("No items");
  });
});
