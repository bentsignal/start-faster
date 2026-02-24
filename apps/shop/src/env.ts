import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

const runtimeEnv =
  (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env ?? import.meta.env;

export const env = createEnv({
  clientPrefix: "VITE_",
  server: {
    SHOPIFY_STORE_DOMAIN: z.string().min(1),
    SHOPIFY_SHOP_ID: z.string().min(1),
    SHOPIFY_STOREFRONT_PRIVATE_TOKEN: z.string().min(1),
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: z.string().min(1),
    SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET: z.string().length(64),
    SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZATION_ENDPOINT: z.url(),
    SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_ENDPOINT: z.url(),
    SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_ENDPOINT: z.url(),
    SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI: z.url(),
    SHOPIFY_CUSTOMER_ACCOUNT_SCOPES: z.string().min(1).optional(),
    SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI: z.url(),
  },
  client: {
    VITE_NODE_ENV: z.enum(["development", "production"]).default("production"),
    VITE_DEV_ALLOWED_HOST: z.string().optional(),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
});
