import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

const runtimeEnv = import.meta.env.SSR
  ? ((
      globalThis as unknown as {
        process?: { env?: Record<string, string | undefined> };
      }
    ).process?.env ?? {})
  : import.meta.env;

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    VITE_CONVEX_URL: z.string().url(),
    VITE_CONVEX_SITE_URL: z.string().url(),
    VITE_SITE_URL: z.string().url(),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
});
