import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@acme/eslint-config/base";
import { reactConfig } from "@acme/eslint-config/react";

export default defineConfig(
  {
    ignores: [
      ".graphqlrc.ts",
      ".vinxi/**",
      "dist/**",
      "src/lib/shopify/generated/**",
      "src/routeTree.gen.ts",
      ".tanstack/**",
    ],
  },
  baseConfig,
  reactConfig,
  restrictEnvAccess,
  {
    rules: {
      "@typescript-eslint/only-throw-error": "off",
    },
  },
);
