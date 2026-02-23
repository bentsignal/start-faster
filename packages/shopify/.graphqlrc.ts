import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { IGraphQLConfig } from "graphql-config";
import {
  ApiType,
  pluckConfig,
  preset,
  shopifyApiProject,
} from "@shopify/api-codegen-preset";

import { API_VERSION } from "./src";

const storefrontTypesOutputPath =
  "./src/storefront/_generated/storefront.types.d.ts";
const customerTypesOutputPath = "./src/customer/_generated/customer.types.d.ts";
const customerSchemaOutputPath = `./src/customer/_generated/customer-${API_VERSION}.schema.json`;
const customerGeneratedOutputPath =
  "./src/customer/_generated/customer.generated.d.ts";

const scalars = {
  Color: "string",
  DateTime: "string",
  Decimal: "number",
  HTML: "string",
  ISO8601DateTime: "string",
  JSON: "unknown",
  URL: "string",
  UnsignedInt64: "number",
} as const;

const storefrontProject = shopifyApiProject({
  apiType: ApiType.Storefront,
  apiVersion: API_VERSION,
  documents: ["./src/storefront/**/*.{ts,tsx}"],
  outputDir: "./src/storefront/_generated",
});
const storefrontTypesOutput =
  storefrontProject.extensions?.codegen?.generates?.[storefrontTypesOutputPath];

const require = createRequire(import.meta.url);
const customerSchemaPath = join(
  dirname(require.resolve("@shopify/hydrogen")),
  "customer-account.schema.json",
);

type CodegenOutputConfig = {
  config?: {
    defaultScalarType?: string;
    scalars?: Record<string, string>;
  };
};

const config: IGraphQLConfig = {
  projects: {
    storefront: {
      ...storefrontProject,
      extensions: {
        ...storefrontProject.extensions,
        codegen: {
          ...storefrontProject.extensions?.codegen,
          generates: {
            ...storefrontProject.extensions?.codegen?.generates,
            [storefrontTypesOutputPath]: {
              ...(storefrontTypesOutput as CodegenOutputConfig),
              config: {
                ...(storefrontTypesOutput as CodegenOutputConfig)?.config,
                defaultScalarType: "unknown",
                scalars: scalars,
              },
            },
          },
        },
      },
    },
    customer: {
      schema: customerSchemaPath,
      documents: ["./src/customer/**/*.{ts,tsx}"],
      extensions: {
        codegen: {
          pluckConfig,
          generates: {
            [customerSchemaOutputPath]: {
              schema: customerSchemaPath,
              plugins: ["introspection"],
              config: {
                minify: true,
              },
            },
            [customerTypesOutputPath]: {
              plugins: ["typescript"],
              config: {
                defaultScalarType: "unknown",
                scalars: scalars,
              },
            },
            [customerGeneratedOutputPath]: {
              preset,
              presetConfig: {
                apiType: ApiType.Customer,
              },
              schema: customerSchemaPath,
              documents: ["./src/customer/**/*.{ts,tsx}"],
            },
          },
        },
      },
    },
  },
};

export default config;
