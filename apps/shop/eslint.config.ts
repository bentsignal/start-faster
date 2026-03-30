import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";
import { reactConfig } from "@acme/eslint-config/react";
import { createStrictSyntax } from "@acme/eslint-config/syntax";

export default defineConfig(
  {
    ignores: [".vinxi/**", "dist/**", "src/routeTree.gen.ts", ".tanstack/**"],
  },
  baseConfig,
  reactConfig,
  createStrictSyntax({ env: true }),
  {
    rules: {
      "@typescript-eslint/only-throw-error": "off",
    },
  },
);
