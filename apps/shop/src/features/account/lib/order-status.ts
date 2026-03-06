import { OrderFulfillmentStatus } from "@acme/shopify/customer/types";

import type { CustomerOrder } from "~/features/account/types";

export function isInProgressOrder(order: CustomerOrder) {
  return order.fulfillmentStatus !== OrderFulfillmentStatus.Fulfilled;
}

export function getFulfillmentStatusLabel(
  fulfillmentStatus: CustomerOrder["fulfillmentStatus"],
) {
  return fulfillmentStatus
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getFinancialStatusLabel(
  financialStatus: CustomerOrder["financialStatus"],
) {
  if (financialStatus == null) {
    return "Unknown";
  }

  return financialStatus
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
