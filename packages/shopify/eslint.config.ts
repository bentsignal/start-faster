import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";

export default defineConfig(
  {
    ignores: [
      ".graphqlrc.ts",
      "src/storefront/_generated/**",
      "src/customer/_generated/**",
      "dist/**",
    ],
  },
  baseConfig,
);
