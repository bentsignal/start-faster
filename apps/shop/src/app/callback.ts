import { createFileRoute } from "@tanstack/react-router";

import { handleCustomerAuthCallback } from "~/lib/shopify/customer-auth.server";

export const Route = createFileRoute("/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code || !state) {
          return new Response("Invalid callback request.", { status: 400 });
        }
        const returnTo = await handleCustomerAuthCallback({ code, state });
        return Response.redirect(returnTo, 302);
      },
    },
  },
});
