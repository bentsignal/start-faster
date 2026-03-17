import { useMutation } from "@tanstack/react-query";
import { Loader, Package } from "lucide-react";

import type { CartLineInput } from "@acme/shopify/storefront/types";
import { QuickLink } from "@acme/features/quick-link";
import { cartCreateForCheckout } from "@acme/shopify/storefront/cart";
import { Button, buttonVariants } from "@acme/ui/button";
import { Card, CardContent, CardHeader } from "@acme/ui/card";
import { toast } from "@acme/ui/toaster";

import type { OrderListItem } from "~/features/account/lib/orders-list-data";
import type { LiveOrderProducts } from "~/features/account/types";
import { OrderProductsSection } from "~/features/account/components/order-products-section";
import { shopify } from "~/lib/shopify";

function formatMoney(amount: number | string, currencyCode: string) {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatusPill({
  label,
  tone = "secondary",
}: {
  label: string;
  tone?: "primary" | "secondary" | "accent" | "success";
}) {
  return (
    <span
      className={
        tone === "primary"
          ? "bg-foreground text-background self-start rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase"
          : tone === "accent"
            ? "self-start rounded-full bg-sky-500/12 px-2.5 py-1 text-xs font-semibold tracking-wide text-sky-800 uppercase ring-1 ring-sky-600/20 ring-inset dark:bg-sky-500/18 dark:text-sky-200 dark:ring-sky-400/30"
            : tone === "success"
              ? "self-start rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-800 uppercase ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-500/18 dark:text-emerald-200 dark:ring-emerald-400/30"
              : "bg-muted text-muted-foreground self-start rounded-full px-2.5 py-1 text-xs font-medium"
      }
    >
      {label}
    </span>
  );
}

function getReorderLines({
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

function getTrackingEntries(order: OrderListItem) {
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

function TrackingNumbers({ order }: { order: OrderListItem }) {
  const trackingEntries = getTrackingEntries(order);

  if (trackingEntries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
      <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
        Tracking
      </span>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-medium">
        {trackingEntries.map((trackingEntry, index) => (
          <span key={`${trackingEntry.number}-${index}`} className="contents">
            {index > 0 ? (
              <span className="text-muted-foreground" aria-hidden="true">
                •
              </span>
            ) : null}
            {trackingEntry.url ? (
              <a
                href={trackingEntry.url}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                {trackingEntry.number}
              </a>
            ) : (
              <span className="text-foreground">{trackingEntry.number}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OrdersList({
  orders,
  liveProducts,
}: {
  orders: OrderListItem[];
  liveProducts: LiveOrderProducts;
}) {
  const reorderMutation = useMutation({
    mutationFn: async ({
      orderId,
      lines,
    }: {
      orderId: string;
      lines: CartLineInput[];
    }) => {
      if (lines.length === 0) {
        throw new Error("No reorder lines are available.");
      }

      const response = await shopify.request(cartCreateForCheckout, {
        variables: {
          lines,
        },
      });
      const checkoutCart = response.data?.cartCreate?.cart;

      if (checkoutCart === null || checkoutCart === undefined) {
        throw new Error(`Unable to create a reorder checkout for ${orderId}.`);
      }

      return checkoutCart;
    },
    onSuccess: (checkoutCart) => {
      window.location.assign(checkoutCart.checkoutUrl);
    },
    onError: () => {
      toast.error("Unable to start reorder checkout. Please try again.");
    },
  });
  const activeReorderOrderId = reorderMutation.isPending
    ? reorderMutation.variables.orderId
    : null;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="bg-muted flex size-16 items-center justify-center rounded-full">
          <Package className="text-muted-foreground size-7" />
        </div>
        <div className="space-y-1.5">
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="text-muted-foreground text-sm">
            When you place an order, it will show up here.
          </p>
        </div>
        <QuickLink to="/" className={buttonVariants()}>
          Start shopping
        </QuickLink>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => {
        const isReorderingThisOrder = activeReorderOrderId === order.id;

        return (
          <Card key={order.id} className="gap-0">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-3">
                  <StatusPill
                    label={order.primaryStatusLabel}
                    tone={order.primaryStatusTone}
                  />
                  <TrackingNumbers order={order} />
                  <div className="space-y-1">
                    <p className="font-semibold">{order.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Placed on {formatDate(order.processedAt)}
                    </p>
                  </div>
                </div>
                <p className="text-base font-semibold">
                  {formatMoney(
                    order.totalPrice.amount,
                    order.totalPrice.currencyCode,
                  )}
                </p>
              </div>
            </CardHeader>
            {order.lineItems.nodes.length > 0 ? (
              <CardContent className="py-6">
                <OrderProductsSection
                  order={order}
                  liveProducts={liveProducts}
                />
              </CardContent>
            ) : null}
            <CardContent className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={order.fulfillmentStatusLabel} />
                <StatusPill label={order.financialStatusLabel} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-22"
                  onClick={() => {
                    const lines = getReorderLines({ order, liveProducts });
                    if (lines.length === 0) {
                      toast.error(
                        "No currently available items from this order can be reordered.",
                      );
                      return;
                    }

                    reorderMutation.mutate({
                      orderId: order.id,
                      lines,
                    });
                  }}
                  disabled={isReorderingThisOrder}
                >
                  {isReorderingThisOrder ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    "Reorder"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
