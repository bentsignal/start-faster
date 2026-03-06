import type { GetCustomerOrdersQuery } from "@acme/shopify/customer/generated";
import type { GetProductsByIdsQuery } from "@acme/shopify/storefront/generated";

export type CustomerOrdersConnection =
  GetCustomerOrdersQuery["customer"]["orders"];

export type CustomerOrder = CustomerOrdersConnection["nodes"][number];

export type CustomerOrderLineItem = CustomerOrder["lineItems"]["nodes"][number];

export type LiveOrderProducts = GetProductsByIdsQuery["nodes"];
