import type { ErrorComponentProps } from "@tanstack/react-router";
import { useMutation, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader, Package } from "lucide-react";

import type { CartLineInput } from "@acme/shopify/storefront/types";
import { QuickLink } from "@acme/features/quick-link";
import { Button, buttonVariants } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import { OrderCard } from "~/features/account/components/order-card";
import { OrdersErrorComponent } from "~/features/account/components/orders-error";
import { accountMutations } from "~/features/account/lib/account-mutations";
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

function useRouteComponent() {
  const ordersQuery = useSuspenseInfiniteQuery({
    ...accountQueries.orders(),
    select: (data) => data.pages.flatMap((page) => page.nodes),
  });
  const customerOrders = ordersQuery.data;
  const productIds = getOrderProductIds(customerOrders);
  const productIdChunks = getProductIdChunks(productIds);
  const orders = getOrdersListData(customerOrders);

  const reorderMutation = useMutation({
    ...accountMutations.reorder(),
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

  const handleReorder = (orderId: string, lines: CartLineInput[]) => {
    reorderMutation.mutate({ orderId, lines });
  };

  return {
    orders,
    productIdChunks,
    activeReorderOrderId,
    handleReorder,
    hasNextPage: ordersQuery.hasNextPage,
    isFetchingNextPage: ordersQuery.isFetchingNextPage,
    fetchNextPage: ordersQuery.fetchNextPage,
  };
}

function RouteComponent() {
  const {
    orders,
    productIdChunks,
    activeReorderOrderId,
    handleReorder,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useRouteComponent();

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
    <div className="space-y-6">
      <div className="grid gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            productIdChunks={productIdChunks}
            isReordering={activeReorderOrderId === order.id}
            onReorder={handleReorder}
          />
        ))}
      </div>
      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            className="w-32"
          >
            {isFetchingNextPage ? (
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
