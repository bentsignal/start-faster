import { createEnv } from "convex-env";
import { betterAuth, environment, oAuth } from "convex-env/presets";
import { v } from "convex/values";

export const env = createEnv({
  ...environment,
  ...betterAuth,
  ...oAuth.google,
  SITE_URL: v.string(),
});
