import { createFileRoute } from "@tanstack/react-router";

import { createCustomerLogoutCookies, normalizeCustomerReturnTo } from "~/lib/auth";

export const Route = createFileRoute("/auth/logout")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const returnTo = url.searchParams.get("returnTo") ?? "/";
        const target = new URL(normalizeCustomerReturnTo(returnTo), url.origin);
        const headers = new Headers();
        headers.set("location", target.toString());
        for (const cookie of createCustomerLogoutCookies(request)) {
          headers.append("set-cookie", cookie);
        }
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
