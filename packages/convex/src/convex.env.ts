import { createEnv } from "convex-env";
import { environment } from "convex-env/presets";
import { v } from "convex/values";

export const env = createEnv({
  ...environment,
  WORKOS_CLIENT_ID: v.string(),
});
