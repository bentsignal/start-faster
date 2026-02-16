"use node";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const computeWebhookDigest = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload, "utf8").digest("base64");

export const verifyWebhookSignature = (args: {
  payload: string;
  secret: string;
  signature: string;
}) => {
  const expected = Buffer.from(computeWebhookDigest(args.payload, args.secret));
  const received = Buffer.from(args.signature);
  if (expected.length !== received.length) {
    return false;
  }
  return timingSafeEqual(expected, received);
};

export const payloadSha256 = (payload: string) =>
  createHash("sha256").update(payload, "utf8").digest("hex");
