import convexPlugin from "@convex-dev/eslint-plugin";
import checkFile from "eslint-plugin-check-file";
import { defineConfig } from "eslint/config";

import { baseConfig, strictConfig } from "@acme/eslint-config/base";
import { createStrictSyntax } from "@acme/eslint-config/syntax";

export default defineConfig(
  {
    ignores: ["src/_generated/**"],
  },
  baseConfig,
  strictConfig,
  createStrictSyntax({ ts: true }),
  ...convexPlugin.configs.recommended,
  {
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "SNAKE_CASE",
        },
        {
          ignoreMiddleExtensions: true,
          errorMessage:
            'Convex filenames must use snake_case (e.g. my_file.ts). "{{ target }}" does not match. Use kebab-case for all other packages.',
        },
      ],
    },
  },
);
