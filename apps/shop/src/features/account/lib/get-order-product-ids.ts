import type { CustomerOrder } from "~/features/account/types";

export function getOrderProductIds(orders: CustomerOrder[]) {
  return orders
    .flatMap((order) => order.lineItems.nodes)
    .map((lineItem) => lineItem.productId)
    .filter((productId): productId is string => productId !== null)
    .filter(
      (productId, index, productIds) => productIds.indexOf(productId) === index,
    )
    .sort();
}

export function getProductIdChunks(productIds: string[], maxChunkSize = 250) {
  const chunks = [];

  for (let start = 0; start < productIds.length; start += maxChunkSize) {
    chunks.push(productIds.slice(start, start + maxChunkSize));
  }

  return chunks;
}
