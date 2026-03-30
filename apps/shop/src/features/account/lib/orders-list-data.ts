import type { CustomerOrder } from "~/features/account/types";
import {
  getCustomerOrderStatus,
  getFinancialStatusLabel,
  getFulfillmentStatusLabel,
} from "~/features/account/lib/order-status";

export type OrderListItem = CustomerOrder & {
  primaryStatusLabel: string;
  primaryStatusTone: "primary" | "accent" | "success";
  fulfillmentStatusLabel: string;
  financialStatusLabel: string;
};

export function getOrdersListData(orders: CustomerOrder[]) {
  return orders.map((order) => {
    const primaryStatus = getCustomerOrderStatus(order);

    return {
      ...order,
      primaryStatusLabel: primaryStatus.label,
      primaryStatusTone: primaryStatus.tone,
      fulfillmentStatusLabel: getFulfillmentStatusLabel(
        order.fulfillmentStatus,
      ),
      financialStatusLabel: getFinancialStatusLabel(order.financialStatus),
    };
  });
}
