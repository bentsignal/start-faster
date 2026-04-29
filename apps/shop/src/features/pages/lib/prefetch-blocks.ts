import type { QueryClient } from "@tanstack/react-query";

import type { Block } from "@acme/convex/page-validators";

import {
  CAROUSEL_PRODUCT_COUNT,
  productQueries,
} from "~/features/product/lib/product-queries";

export function prefetchBlockData(queryClient: QueryClient, blocks: Block[]) {
  return Promise.all(
    blocks.flatMap((block) => {
      if (block.type !== "product-carousel" || block.data.status !== "ready") {
        return [];
      }

      return queryClient.ensureQueryData(
        productQueries.getProductsByCollection({
          handle: block.data.collectionHandle,
          first: CAROUSEL_PRODUCT_COUNT,
        }),
      );
    }),
  );
}
