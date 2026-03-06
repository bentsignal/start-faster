import { Package } from "lucide-react";

import { Button, buttonVariants } from "@acme/ui/button";
import { Card, CardContent, CardHeader } from "@acme/ui/card";

import type { OrderListItem } from "~/features/account/lib/orders-list-data";
import type { LiveOrderProducts } from "~/features/account/types";
import { Link } from "~/components/link";
import { OrderProductsSection } from "~/features/account/components/order-products-section";

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
  tone?: "primary" | "secondary" | "success";
}) {
  return (
    <span
      className={
        tone === "primary"
          ? "bg-foreground text-background rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase"
          : tone === "success"
            ? "rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-800 uppercase ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-500/18 dark:text-emerald-200 dark:ring-emerald-400/30"
            : "bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium"
      }
    >
      {label}
    </span>
  );
}

export function OrdersList({
  orders,
  liveProducts,
}: {
  orders: OrderListItem[];
  liveProducts: LiveOrderProducts;
}) {
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
        <Link to="/" className={buttonVariants()}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <Card key={order.id} className="gap-0">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-4">
                <div>
                  <StatusPill
                    label={order.primaryStatusLabel}
                    tone={order.primaryStatusTone}
                  />
                </div>
                <div>
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
              <Button size="sm" disabled>
                Reorder unavailable
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
