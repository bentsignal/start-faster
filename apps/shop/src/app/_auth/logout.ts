import { createFileRoute } from "@tanstack/react-router";

import {
  createCustomerLogoutCookies,
  isTrustedCustomerAuthRequest,
  normalizeCustomerReturnTo,
} from "~/lib/auth";

export const Route = createFileRoute("/_auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);

        if (!isTrustedCustomerAuthRequest(request)) {
          return new Response("Invalid auth request origin.", { status: 403 });
        }

        const formData = await request.formData();
        const returnTo =
          typeof formData.get("returnTo") === "string"
            ? (formData.get("returnTo") as string)
            : "/";
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
