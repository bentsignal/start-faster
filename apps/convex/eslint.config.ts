import convexPlugin from "@convex-dev/eslint-plugin";
import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";

export default defineConfig(
  {
    ignores: ["src/_generated/**"],
  },
  baseConfig,
  ...convexPlugin.configs.recommended,
);
