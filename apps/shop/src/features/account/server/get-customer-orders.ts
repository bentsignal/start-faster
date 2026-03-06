import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod/v4";

import { getCustomerOrders } from "@acme/shopify/customer/account";

import type { CustomerOrdersConnection } from "~/features/account/types";
import { createHydrogenCustomerAuthContext } from "~/lib/auth";

const getCustomerOrdersInputSchema = z.object({
  after: z.string().nullable().optional(),
  first: z.number().int().min(1).max(20).default(10),
});

export const getCustomerOrdersPage = createServerFn({ method: "GET" })
  .inputValidator(getCustomerOrdersInputSchema)
  .handler(async ({ data }): Promise<CustomerOrdersConnection> => {
    const request = getRequest();
    const { customerAccount } = await createHydrogenCustomerAuthContext({
      request,
    });

    const response = await customerAccount.query(getCustomerOrders, {
      variables: {
        after: data.after ?? null,
        first: data.first,
      },
    });

    return response.data.customer.orders;
  });
