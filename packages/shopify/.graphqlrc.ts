import type { IGraphQLConfig } from "graphql-config";
import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";
import {
  getSchema,
  preset as hydrogenPreset,
  pluckConfig,
} from "@shopify/hydrogen-codegen";

import { API_VERSION } from "./src";

const storefrontTypesOutputPath =
  "./src/storefront/_generated/storefront.types.d.ts";
const customerTypesOutputPath = "./src/customer/_generated/customer.types.d.ts";
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
      schema: getSchema("storefront"),
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
      schema: getSchema("customer-account"),
      documents: ["./src/customer/**/*.{ts,tsx}"],
      extensions: {
        codegen: {
          pluckConfig,
          generates: {
            [customerTypesOutputPath]: {
              plugins: ["typescript"],
              config: {
                defaultScalarType: "unknown",
                scalars: scalars,
              },
            },
            [customerGeneratedOutputPath]: {
              preset: hydrogenPreset,
              presetConfig: {
                importTypes: {
                  namespace: "CustomerTypes",
                  from: "./customer.types.d.ts",
                },
              },
              documents: ["./src/customer/**/*.{ts,tsx}"],
            },
          },
        },
      },
    },
  },
};

export default config;
