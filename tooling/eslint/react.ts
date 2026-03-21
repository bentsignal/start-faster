import reactPlugin from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

const MAX_COMPONENT_PROPS = 6;
const maxComponentPropsPattern = `[properties.${MAX_COMPONENT_PROPS}]`;

export const reactConfig = defineConfig(
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    ...reactCompiler.configs.recommended,
    languageOptions: {
      ...reactPlugin.configs.flat.recommended?.languageOptions,
      ...reactPlugin.configs.flat["jsx-runtime"]?.languageOptions,
      globals: {
        React: "writable",
      },
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
  reactHooks.configs.flat["recommended-latest"]!,
);

export const strictAppBoundariesConfig = defineConfig({
  files: ["src/**/*.ts", "src/**/*.tsx"],
  rules: {
    complexity: ["error", 10],
    "max-lines": [
      "error",
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    "max-lines-per-function": [
      "error",
      {
        max: 60,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    "max-params": ["error", 4],
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "MemberExpression[object.type='MetaProperty'][object.meta.name='import'][object.property.name='meta'][property.name='env']",
        message:
          "Use `import { env } from '~/env'` instead to ensure validated types.",
      },
      {
        selector: `ObjectPattern[parent.type='FunctionDeclaration'][parent.id.name=/^[A-Z]/]${maxComponentPropsPattern}`,
        message: `Components cannot declare more than ${MAX_COMPONENT_PROPS} props.`,
      },
      {
        selector: `ObjectPattern[parent.type='ArrowFunctionExpression'][parent.parent.type='VariableDeclarator'][parent.parent.id.name=/^[A-Z]/]${maxComponentPropsPattern}`,
        message: `Components cannot declare more than ${MAX_COMPONENT_PROPS} props.`,
      },
      {
        selector: `ObjectPattern[parent.type='FunctionExpression'][parent.parent.type='VariableDeclarator'][parent.parent.id.name=/^[A-Z]/]${maxComponentPropsPattern}`,
        message: `Components cannot declare more than ${MAX_COMPONENT_PROPS} props.`,
      },
    ],
  },
});
