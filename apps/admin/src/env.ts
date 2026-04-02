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
    WORKOS_REDIRECT_URI: z.url(),
    CONVEX_DEPLOY_KEY: z.string().min(1).optional(),
  },
  client: {
    VITE_NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("production"),
    VITE_CONVEX_URL: z.url(),
    VITE_SITE_URL: z.url(),
    VITE_CMS_URL: z.url(),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
});
