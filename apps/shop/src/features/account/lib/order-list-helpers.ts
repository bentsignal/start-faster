import type { CartLineInput } from "@acme/shopify/storefront/types";

import type { OrderListItem } from "~/features/account/lib/orders-list-data";
import type { LiveOrderProducts } from "~/features/account/types";

export function formatMoney(amount: number | string, currencyCode: string) {
  const parsedAmount =
    typeof amount === "number" ? amount : Number.parseFloat(amount);
  if (Number.isNaN(parsedAmount)) {
    return `${amount} ${currencyCode}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parsedAmount);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getReorderLines({
  order,
  liveProducts,
}: {
  order: OrderListItem;
  liveProducts: LiveOrderProducts;
}) {
  const liveProductsById = new Map<
    string,
    Extract<LiveOrderProducts[number], { __typename: "Product" }>
  >();

  for (const product of liveProducts) {
    if (product?.__typename !== "Product") {
      continue;
    }

    liveProductsById.set(product.id, product);
  }

  return order.lineItems.nodes.flatMap((lineItem): CartLineInput[] => {
    if (lineItem.productId == null || lineItem.variantId == null) {
      return [];
    }

    const liveProduct = liveProductsById.get(lineItem.productId);
    if (liveProduct === undefined) {
      return [];
    }

    const hasLiveVariant = liveProduct.variants.nodes.some(
      (variant) => variant.id === lineItem.variantId,
    );
    if (hasLiveVariant === false) {
      return [];
    }

    return [
      {
        merchandiseId: lineItem.variantId,
        quantity: lineItem.quantity,
      },
    ];
  });
}

export function getTrackingEntries(order: OrderListItem) {
  const entries = order.fulfillments.nodes.flatMap((fulfillment) =>
    fulfillment.trackingInformation.flatMap((trackingInformation) => {
      const label = trackingInformation.number?.trim();
      if (!label) {
        return [];
      }

      return [
        {
          number: label,
          url: trackingInformation.url ?? null,
        },
      ];
    }),
  );

  return entries.filter((entry, index, allEntries) => {
    return (
      allEntries.findIndex(
        (candidate) =>
          candidate.number === entry.number && candidate.url === entry.url,
      ) === index
    );
  });
}
