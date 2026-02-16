import { describe, expect, it } from "vitest";

import {
  computeWebhookDigest,
  payloadSha256,
  verifyWebhookSignature,
} from "../security";

describe("shopify webhook security", () => {
  it("verifies a valid signature", () => {
    const payload = '{"id":1}';
    const secret = "top_secret";
    const signature = computeWebhookDigest(payload, secret);
    expect(
      verifyWebhookSignature({
        payload,
        secret,
        signature,
      }),
    ).toBe(true);
  });

  it("rejects an invalid signature", () => {
    expect(
      verifyWebhookSignature({
        payload: '{"id":1}',
        secret: "top_secret",
        signature: "bad_signature",
      }),
    ).toBe(false);
  });

  it("produces stable payload hash", () => {
    expect(payloadSha256('{"a":1}')).toBe(
      "015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862",
    );
  });
});
