import type {
  StorefrontMutations,
  StorefrontQueries,
} from "@shopify/storefront-api-client";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { env } from "~/env";

function normalizeStoreDomain(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  return `https://${input}`;
}

function getStorefrontClient() {
  const privateToken = env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (privateToken) {
    return createStorefrontApiClient({
      storeDomain: normalizeStoreDomain(env.SHOPIFY_STORE_DOMAIN),
      apiVersion: "2025-10",
      privateAccessToken: privateToken,
    });
  }
  const publicToken = env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
  if (publicToken === undefined || publicToken.length === 0) {
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

type StorefrontOperation = keyof StorefrontQueries | keyof StorefrontMutations;

type StorefrontOperationVariables<TOperation extends StorefrontOperation> =
  TOperation extends keyof StorefrontQueries
    ? StorefrontQueries[TOperation]["variables"]
    : TOperation extends keyof StorefrontMutations
      ? StorefrontMutations[TOperation]["variables"]
      : never;

type StorefrontOperationReturn<TOperation extends StorefrontOperation> =
  TOperation extends keyof StorefrontQueries
    ? StorefrontQueries[TOperation]["return"]
    : TOperation extends keyof StorefrontMutations
      ? StorefrontMutations[TOperation]["return"]
      : never;

export async function storefrontRequest<TOperation extends StorefrontOperation>(
  query: TOperation,
  variables?: StorefrontOperationVariables<TOperation>,
): Promise<StorefrontOperationReturn<TOperation>>;
export async function storefrontRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(query: string, variables?: TVariables): Promise<TData>;
export async function storefrontRequest(
  query: string,
  variables?: Record<string, unknown>,
) {
  const storefrontClient = getStorefrontClient();
  const response = (await storefrontClient.request(query, {
    variables,
  })) as {
    data?: unknown;
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
  return response.data;
}
