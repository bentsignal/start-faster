import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

const runtimeEnv =
  typeof window === "undefined"
    ? ((
        globalThis as {
          process?: { env?: Record<string, string | undefined> };
        }
      ).process?.env ?? import.meta.env)
    : import.meta.env;

export const env = createEnv({
  clientPrefix: "VITE_",
  server: {
    WORKOS_CLIENT_ID: z.string().min(1),
    WORKOS_API_KEY: z.string().min(1),
    WORKOS_COOKIE_PASSWORD: z.string().min(32),
    // we set this programmatically so the env var doesn't actually get used, but the auth kit
    // sdk throws an error if it isn't present so we have to set it to something. just set to "placeholder"
    // or something like that in your env in dev AND production.
    WORKOS_REDIRECT_URI: z.string(),
    CONVEX_DEPLOY_KEY: z.string().min(1).optional(),
  },
  client: {
    VITE_NODE_ENV: z.enum(["development", "production"]).default("production"),
    VITE_CONVEX_URL: z.url(),
    VITE_UT_URL: z.url(),
    VITE_WORKTREE_ID: z.string().optional(),
    VITE_SHOPIFY_STORE_DOMAIN: z.string().min(1),
    VITE_SHOPIFY_PUBLIC_TOKEN: z.string().min(1),
    VITE_SHOPIFY_IMAGE_URL_STORE_ID: z.string().min(1),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
});
