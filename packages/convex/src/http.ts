import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/shopify/webhooks",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const signature = req.headers.get("x-shopify-hmac-sha256");
    const topic = req.headers.get("x-shopify-topic");
    const shopDomain = req.headers.get("x-shopify-shop-domain");
    const deliveryId =
      req.headers.get("x-shopify-webhook-id") ??
      req.headers.get("x-shopify-event-id");

    if (!signature || !topic || !shopDomain || !deliveryId) {
      return new Response("Missing headers", { status: 400 });
    }

    const rawBody = await req.text();
    const triggeredAt = req.headers.get("x-shopify-triggered-at") ?? undefined;

    const result: { accepted: boolean } = await ctx.runAction(
      internal.shopify.webhooks.verifyAndEnqueueWebhook,
      {
        rawBody,
        topic,
        shopDomain,
        deliveryId,
        signature,
        triggeredAt,
      },
    );

    if (!result.accepted) {
      return new Response("Unauthorized", { status: 401 });
    }
    return new Response("ok", { status: 200 });
  }),
});

export default http;
