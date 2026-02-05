import { createEnv } from "convex-env";
import { betterAuth, environment, uploadthing } from "convex-env/presets";
import { v } from "convex/values";

export const env = createEnv({
  ...environment,
  ...betterAuth,
  ...uploadthing,
  SITE_URL: v.string(),
});
