import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { env } from "~/env";

function normalizeStoreDomain(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  return `https://${input}`;
}

function getStorefrontClient() {
  const privateToken: unknown = env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (typeof privateToken === "string" && privateToken.length > 0) {
    return createStorefrontApiClient({
      storeDomain: normalizeStoreDomain(env.SHOPIFY_STORE_DOMAIN),
      apiVersion: "2025-10",
      privateAccessToken: privateToken,
    });
  }
  const publicToken: unknown = env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
  if (typeof publicToken !== "string" || publicToken.length === 0) {
    throw new Error(
      "Missing Shopify Storefront token. Set SHOPIFY_STOREFRONT_PRIVATE_TOKEN or SHOPIFY_STOREFRONT_PUBLIC_TOKEN.",
    );
  }
  return createStorefrontApiClient({
    storeDomain: normalizeStoreDomain(env.SHOPIFY_STORE_DOMAIN),
    apiVersion: "2025-10",
    publicAccessToken: publicToken,
  });
}

export async function storefrontRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(query: string, variables?: TVariables): Promise<TData> {
  const storefrontClient = getStorefrontClient();
  const response = (await storefrontClient.request(query, { variables })) as {
    data?: TData;
    errors?: ({ message?: string } | string)[];
  };
  if (response.errors?.length) {
    const message = response.errors
      .map((error) =>
        typeof error === "string"
          ? error
          : (error.message ?? "Unknown Shopify error"),
      )
      .join("; ");
    throw new Error(`Shopify query failed: ${message}`);
  }
  if (!response.data) {
    throw new Error("Shopify query returned no data.");
  }
  return response.data as TData;
}
