import { createFileRoute } from "@tanstack/react-router";

import {
  createHydrogenCustomerAuthContext,
  isTrustedCustomerAuthRequest,
} from "~/lib/auth";

export const Route = createFileRoute("/_auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isTrustedCustomerAuthRequest(request)) {
          return new Response("Invalid auth request origin.", { status: 403 });
        }
        const requestUrl = new URL(request.url);
        const postLogoutRedirectUri = new URL(
          "/",
          requestUrl.origin,
        ).toString();
        const { customerAccount } = await createHydrogenCustomerAuthContext({
          request,
          returnTo: "/",
        });
        return customerAccount.logout({
          postLogoutRedirectUri,
        });
      },
    },
  },
});
