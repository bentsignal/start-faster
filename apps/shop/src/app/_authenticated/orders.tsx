import type { ErrorComponentProps } from "@tanstack/react-router";
import { useQueries, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";

import { OrdersErrorComponent } from "~/features/account/components/orders-error";
import { OrdersList } from "~/features/account/components/orders-list";
import { accountQueries } from "~/features/account/lib/account-queries";
import {
  getOrderProductIds,
  getProductIdChunks,
} from "~/features/account/lib/get-order-product-ids";
import { getOrdersListData } from "~/features/account/lib/orders-list-data";

export const Route = createFileRoute("/_authenticated/orders")({
  component: RouteComponent,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <OrdersErrorComponent error={error} onRetry={reset} />
  ),
  loader: async ({ context }) => {
    const ordersData = await context.queryClient.ensureInfiniteQueryData(
      accountQueries.orders(),
    );
    const customerOrders = ordersData.pages.flatMap((page) => page.nodes);
    const productIds = getOrderProductIds(customerOrders);
    const productIdChunks = getProductIdChunks(productIds);

    await Promise.all(
      productIdChunks.map((ids) =>
        context.queryClient.ensureQueryData(accountQueries.liveProducts(ids)),
      ),
    );
  },
});

function RouteComponent() {
  const ordersQuery = useSuspenseInfiniteQuery(accountQueries.orders());
  const customerOrders = ordersQuery.data.pages.flatMap((page) => page.nodes);
  const productIds = getOrderProductIds(customerOrders);
  const productIdChunks = getProductIdChunks(productIds);
  const liveProductQueries = useQueries({
    queries: productIdChunks.map((ids) => accountQueries.liveProducts(ids)),
  });
  const liveProducts = liveProductQueries.flatMap((query) => query.data ?? []);
  const orders = getOrdersListData(customerOrders);

  return (
    <div className="space-y-6">
      <OrdersList orders={orders} liveProducts={liveProducts} />
      {ordersQuery.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              void ordersQuery.fetchNextPage();
            }}
            disabled={ordersQuery.isFetchingNextPage}
            className="w-32"
          >
            {ordersQuery.isFetchingNextPage ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
