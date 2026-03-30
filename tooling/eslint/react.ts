import reactPlugin from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

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
        max: 100,
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
        selector:
          "FunctionDeclaration[returnType]:not([returnType.typeAnnotation.type='TSTypePredicate'])",
        message:
          "Do not annotate return types. Let TypeScript infer them so the types stay in sync with the implementation.",
      },
      {
        selector:
          "ArrowFunctionExpression[returnType][parent.type='VariableDeclarator']:not([returnType.typeAnnotation.type='TSTypePredicate'])",
        message:
          "Do not annotate return types. Let TypeScript infer them so the types stay in sync with the implementation.",
      },
      {
        selector:
          "CallExpression:matches([callee.name='useSearch'], [callee.property.name='useSearch']):not(:has(Property[key.name='select']))",
        message:
          "useSearch must include a `select` option so the component only re-renders when the selected slice changes.",
      },
      {
        selector:
          "CallExpression:matches([callee.name='useSuspenseQuery'], [callee.property.name='useSuspenseQuery']):not(:has(Property[key.name='select']))",
        message:
          "useSuspenseQuery must include a `select` option so the component only subscribes to the data it needs.",
      },
      {
        selector:
          "CallExpression:matches([callee.name='useRouteContext'], [callee.property.name='useRouteContext']):not(:has(Property[key.name='select']))",
        message:
          "useRouteContext must include a `select` option so the component only re-renders when the selected slice changes.",
      },
      {
        selector:
          "CallExpression:matches([callee.name='useLoaderData'], [callee.property.name='useLoaderData']):not(:has(Property[key.name='select']))",
        message:
          "useLoaderData must include a `select` option so the component only re-renders when the selected slice changes.",
      },
      {
        selector: "CallExpression[callee.name='useContext']",
        message:
          "useContext does not support fine-grained selection and causes re-renders on every context change. Use a Rostra store with a selector instead. Use the rostra skill for more information.",
      },
      {
        selector: "CallExpression[callee.name='useEffect']",
        message:
          "useEffect is banned by default. If you genuinely need an effect to sync with an external system and no better solution exists, add an eslint-disable comment with an explanation of why an effect is necessary. For more information on why you should typically avoid useEffect, see: https://react.dev/learn/you-might-not-need-an-effect",
      },
      {
        selector:
          "Property[key.name='select'][value.type='ArrowFunctionExpression'][value.params.length=1][value.body.type='Identifier']",
        message:
          "Identity select (e.g. `select: (data) => data`) is not allowed. The select must narrow to only the fields the component needs.",
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "react",
            importNames: ["useMemo", "useCallback", "memo"],
            message:
              "React Compiler handles memoization automatically. Only use manual memoization as an escape hatch with a comment explaining why.",
          },
        ],
      },
    ],
  },
});
