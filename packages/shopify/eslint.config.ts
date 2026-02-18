import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";

export default defineConfig(
  {
    ignores: [".graphqlrc.ts", "src/generated/**", "dist/**"],
  },
  baseConfig,
);
