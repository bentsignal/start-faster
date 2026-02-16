"use node";

import { createClient } from "./genql/admin";
import { getShopifyAdminConfig } from "./config";
import type {
  ShopifyCollectionSnapshot,
  ShopifyProductSnapshot,
  ShopifyVariantSnapshot,
} from "./types";

const adminClient = () => {
  const config = getShopifyAdminConfig();
  return createClient({
    url: `https://${config.domain}/admin/api/${config.apiVersion}/graphql.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.accessToken,
    },
  });
};

const toStatus = (value: "ACTIVE" | "ARCHIVED" | "DRAFT") => {
  if (value === "ACTIVE") return "active";
  if (value === "ARCHIVED") return "archived";
  return "draft";
};

const mapImage = (image: {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
} | null) =>
  image
    ? {
        url: image.url,
        altText: image.altText ?? undefined,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
      }
    : undefined;

const mapVariant = (
  productId: string,
  variant: {
    id: string;
    sku?: string | null;
    title: string;
    availableForSale: boolean;
    selectedOptions: { name: string; value: string }[];
    price: { amount: string; currencyCode: string };
    compareAtPrice?: { amount: string } | null;
    inventoryPolicy?: "CONTINUE" | "DENY" | null;
    updatedAt: string;
  },
): ShopifyVariantSnapshot => ({
  shopifyVariantId: variant.id,
  shopifyProductId: productId,
  sku: variant.sku ?? undefined,
  title: variant.title,
  availableForSale: variant.availableForSale,
  selectedOptions: variant.selectedOptions.map((option) => ({
    name: option.name,
    value: option.value,
  })),
  priceAmount: variant.price.amount,
  compareAtPriceAmount: variant.compareAtPrice?.amount ?? undefined,
  currencyCode: variant.price.currencyCode,
  inventoryPolicy: variant.inventoryPolicy ?? undefined,
  updatedAt: variant.updatedAt,
});

const mapProduct = (product: {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  options: { name: string; values: string[] }[];
  variants: {
    edges: {
      node: {
        id: string;
        sku?: string | null;
        title: string;
        availableForSale: boolean;
        selectedOptions: { name: string; value: string }[];
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string } | null;
        inventoryPolicy?: "CONTINUE" | "DENY" | null;
        updatedAt: string;
      };
    }[];
  };
  collections: {
    edges: {
      node: { id: string };
    }[];
  };
  updatedAt: string;
  publishedAt?: string | null;
}): ShopifyProductSnapshot => {
  const variants = product.variants.edges.map((edge) =>
    mapVariant(product.id, edge.node),
  );
  const prices = variants.map((variant) => Number(variant.priceAmount));
  const min = prices.length > 0 ? Math.min(...prices).toString() : "0";
  const max = prices.length > 0 ? Math.max(...prices).toString() : "0";
  const currencyCode = variants.at(0)?.currencyCode ?? "USD";
  return {
    shopifyProductId: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    status: toStatus(product.status),
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    featuredImage: mapImage(product.featuredImage ?? null),
    options: product.options.map((option) => ({
      name: option.name,
      values: option.values,
    })),
    minPriceAmount: min,
    maxPriceAmount: max,
    currencyCode,
    publishedAt: product.publishedAt ?? undefined,
    updatedAt: product.updatedAt,
    variants,
    collectionShopifyIds: product.collections.edges.map((edge) => edge.node.id),
  };
};

const mapCollection = (collection: {
  id: string;
  handle: string;
  title: string;
  description: string;
  updatedAt: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}): ShopifyCollectionSnapshot => ({
  shopifyCollectionId: collection.id,
  handle: collection.handle,
  title: collection.title,
  description: collection.description,
  image: mapImage(collection.image ?? null),
  updatedAt: collection.updatedAt,
});

export const fetchProductsUpdatedSince = async (args: {
  updatedSince?: string;
  cursor?: string;
  limit?: number;
}) => {
  const client = adminClient();
  const limit = Math.max(1, Math.min(args.limit ?? 50, 100));
  const queryFilter = args.updatedSince
    ? `updated_at:>=${args.updatedSince}`
    : undefined;
  const result = await client.query({
    products: {
      __args: {
        first: limit,
        after: args.cursor ?? null,
        query: queryFilter ?? null,
      },
      pageInfo: {
        hasNextPage: true,
        endCursor: true,
      },
      edges: {
        node: {
          id: true,
          handle: true,
          title: true,
          description: true,
          descriptionHtml: true,
          status: true,
          vendor: true,
          productType: true,
          tags: true,
          featuredImage: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
          options: {
            name: true,
            values: true,
          },
          variants: {
            __args: { first: 100 },
            edges: {
              node: {
                id: true,
                sku: true,
                title: true,
                availableForSale: true,
                selectedOptions: {
                  name: true,
                  value: true,
                },
                price: {
                  amount: true,
                  currencyCode: true,
                },
                compareAtPrice: {
                  amount: true,
                },
                inventoryPolicy: true,
                updatedAt: true,
              },
            },
          },
          collections: {
            __args: { first: 100 },
            edges: {
              node: {
                id: true,
              },
            },
          },
          updatedAt: true,
          publishedAt: true,
        },
      },
    },
  });

  return {
    products: result.products.edges.map((edge) => mapProduct(edge.node)),
    hasNextPage: result.products.pageInfo.hasNextPage,
    cursor: result.products.pageInfo.endCursor ?? undefined,
  };
};

export const fetchCollectionsUpdatedSince = async (args: {
  updatedSince?: string;
  cursor?: string;
  limit?: number;
}) => {
  const client = adminClient();
  const limit = Math.max(1, Math.min(args.limit ?? 50, 100));
  const queryFilter = args.updatedSince
    ? `updated_at:>=${args.updatedSince}`
    : undefined;
  const result = await client.query({
    collections: {
      __args: {
        first: limit,
        after: args.cursor ?? null,
        query: queryFilter ?? null,
      },
      pageInfo: {
        hasNextPage: true,
        endCursor: true,
      },
      edges: {
        node: {
          id: true,
          handle: true,
          title: true,
          description: true,
          updatedAt: true,
          image: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
      },
    },
  });
  return {
    collections: result.collections.edges.map((edge) => mapCollection(edge.node)),
    hasNextPage: result.collections.pageInfo.hasNextPage,
    cursor: result.collections.pageInfo.endCursor ?? undefined,
  };
};
