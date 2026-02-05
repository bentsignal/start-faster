import { createEnv } from "convex-env";
import {
  betterAuth,
  environment,
  oAuth,
  uploadthing,
} from "convex-env/presets";
import { v } from "convex/values";

export const env = createEnv({
  ...environment,
  ...betterAuth,
  ...oAuth.google,
  ...uploadthing,
  SITE_URL: v.string(),
});
