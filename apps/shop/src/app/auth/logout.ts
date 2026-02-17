import { createFileRoute } from "@tanstack/react-router";

import { clearCustomerSession } from "~/lib/shopify/customer-auth.server";

export const Route = createFileRoute("/auth/logout")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const returnTo = url.searchParams.get("returnTo") ?? "/";
        clearCustomerSession();
        return Response.redirect(returnTo, 302);
      },
    },
  },
});
