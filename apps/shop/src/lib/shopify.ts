import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { API_VERSION } from "@acme/shopify";

import { env } from "~/env";

export const shopify = createStorefrontApiClient({
  storeDomain: env.SHOPIFY_STORE_DOMAIN,
  apiVersion: API_VERSION,
  privateAccessToken: env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
});
