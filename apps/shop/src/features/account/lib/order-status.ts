import {
  FulfillmentEventStatus,
  OrderFulfillmentStatus,
} from "@acme/shopify/customer/types";

import type { CustomerOrder } from "~/features/account/types";

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

export function hasTrackingNumber(order: CustomerOrder) {
  return order.fulfillments.nodes.some((fulfillment) =>
    fulfillment.trackingInformation.some(
      (trackingInformation) => trackingInformation.number?.trim().length,
    ),
  );
}

function getLatestShipmentStatuses(order: CustomerOrder) {
  return order.fulfillments.nodes.flatMap((fulfillment) => {
    if (fulfillment.latestShipmentStatus == null) {
      return [];
    }

    return [fulfillment.latestShipmentStatus];
  });
}

export function getCustomerOrderStatus(order: CustomerOrder) {
  const latestShipmentStatuses = getLatestShipmentStatuses(order);

  if (latestShipmentStatuses.includes(FulfillmentEventStatus.Delivered)) {
    return {
      label: "Delivered",
      tone: "success",
    } as const;
  }

  if (
    hasTrackingNumber(order) ||
    latestShipmentStatuses.length > 0 ||
    order.fulfillmentStatus === OrderFulfillmentStatus.Fulfilled
  ) {
    return {
      label: "Shipped",
      tone: "accent",
    } as const;
  }

  return {
    label: "In progress",
    tone: "primary",
  } as const;
}
