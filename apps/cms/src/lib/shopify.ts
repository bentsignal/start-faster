import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { API_VERSION } from "@acme/shopify";

import { env } from "~/env";

export const shopify = createStorefrontApiClient({
  storeDomain: env.VITE_SHOPIFY_STORE_DOMAIN,
  apiVersion: API_VERSION,
  publicAccessToken: env.VITE_SHOPIFY_PUBLIC_TOKEN,
});
