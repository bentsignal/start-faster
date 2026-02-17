import type { IGraphQLConfig } from "graphql-config";
import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";

const config: IGraphQLConfig = {
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: "2025-10",
      documents: ["./src/**/*.{ts,tsx}"],
      outputDir: "./src/lib/shopify/generated",
    }),
  },
};

export default config;
