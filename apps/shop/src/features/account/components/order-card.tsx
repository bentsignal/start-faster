import { useSuspenseQueries } from "@tanstack/react-query";
import { Loader } from "lucide-react";

import type { CartLineInput } from "@acme/shopify/storefront/types";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader } from "@acme/ui/card";
import { toast } from "@acme/ui/toaster";

import type { OrderListItem } from "~/features/account/lib/orders-list-data";
import type { LiveOrderProducts } from "~/features/account/types";
import { OrderProductsSection } from "~/features/account/components/order-products-section";
import { StatusPill } from "~/features/account/components/status-pill";
import { TrackingNumbers } from "~/features/account/components/tracking-numbers";
import { accountQueries } from "~/features/account/lib/account-queries";
import {
  formatDate,
  getReorderLines,
} from "~/features/account/lib/order-list-helpers";
import { formatMoney } from "~/lib/format-money";

function useOrderLiveProducts(
  order: OrderListItem,
  productIdChunks: string[][],
) {
  const orderProductIds = new Set<string>();
  for (const lineItem of order.lineItems.nodes) {
    if (lineItem.productId != null) {
      orderProductIds.add(lineItem.productId);
    }
  }

  const liveProductQueries = useSuspenseQueries({
    queries: productIdChunks.map((ids) => ({
      ...accountQueries.liveProducts(ids),
      select: (data: LiveOrderProducts) =>
        data.filter(
          (product) =>
            product?.__typename === "Product" &&
            orderProductIds.has(product.id),
        ),
    })),
  });

  return liveProductQueries.flatMap((query) => query.data);
}

export function OrderCard({
  order,
  productIdChunks,
  isReordering,
  onReorder,
}: {
  order: OrderListItem;
  productIdChunks: string[][];
  isReordering: boolean;
  onReorder: (orderId: string, lines: CartLineInput[]) => void;
}) {
  const liveProducts = useOrderLiveProducts(order, productIdChunks);
  return (
    <Card className="gap-0">
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
          <OrderProductsSection order={order} liveProducts={liveProducts} />
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

              onReorder(order.id, lines);
            }}
            disabled={isReordering}
          >
            {isReordering ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              "Reorder"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
