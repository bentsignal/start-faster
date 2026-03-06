import type { CustomerOrder } from "~/features/account/types";
import {
  getFinancialStatusLabel,
  getFulfillmentStatusLabel,
  isInProgressOrder,
} from "~/features/account/lib/order-status";

export type OrderListItem = CustomerOrder & {
  primaryStatusLabel: string;
  primaryStatusTone: "primary" | "success";
  fulfillmentStatusLabel: string;
  financialStatusLabel: string;
};

export function getOrdersListData(orders: CustomerOrder[]): OrderListItem[] {
  return orders.map((order) => {
    const isInProgress = isInProgressOrder(order);

    return {
      ...order,
      primaryStatusLabel: isInProgress ? "In progress" : "Completed",
      primaryStatusTone: isInProgress ? "primary" : "success",
      fulfillmentStatusLabel: getFulfillmentStatusLabel(
        order.fulfillmentStatus,
      ),
      financialStatusLabel: getFinancialStatusLabel(order.financialStatus),
    };
  });
}
