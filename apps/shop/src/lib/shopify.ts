import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { env } from "~/env";

export const shopify = createStorefrontApiClient({
  storeDomain: env.SHOPIFY_STORE_DOMAIN,
  apiVersion: "2026-01",
  privateAccessToken: env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
});
