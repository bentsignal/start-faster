import { createFileRoute } from "@tanstack/react-router";

import {
  handleCustomerAuthCallback,
  normalizeCustomerReturnTo,
} from "~/lib/auth";

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
        const { returnTo, clearOAuthCookie, sessionCookie } =
          await handleCustomerAuthCallback({
            request,
            code,
            state,
          });
        const target = new URL(normalizeCustomerReturnTo(returnTo), url.origin);
        const headers = new Headers();
        headers.set("location", target.toString());
        headers.append("set-cookie", clearOAuthCookie);
        headers.append("set-cookie", sessionCookie);
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
