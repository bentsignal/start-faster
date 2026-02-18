import type { IGraphQLConfig } from "graphql-config";
import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";

const storefrontTypesOutputPath = "./src/generated/storefront.types.d.ts";

const storefrontScalarMappings = {
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
  apiVersion: "2025-10",
  documents: ["./src/**/*.{ts,tsx}"],
  outputDir: "./src/generated",
});

type CodegenOutputConfig = {
  config?: {
    defaultScalarType?: string;
    scalars?: Record<string, string>;
  };
};

const storefrontTypesOutput =
  storefrontProject.extensions?.codegen?.generates?.[storefrontTypesOutputPath];

const config: IGraphQLConfig = {
  projects: {
    default: {
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
                scalars: storefrontScalarMappings,
              },
            },
          },
        },
      },
    },
  },
};

export default config;
