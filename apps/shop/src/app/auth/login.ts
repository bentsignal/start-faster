import { createFileRoute } from "@tanstack/react-router";

import { createCustomerLoginUrl } from "~/lib/auth";

export const Route = createFileRoute("/auth/login")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const returnTo = url.searchParams.get("returnTo") ?? "/";
        const href = createCustomerLoginUrl(returnTo);
        return Response.redirect(href, 302);
      },
    },
  },
});
