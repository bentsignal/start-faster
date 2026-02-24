import { createFileRoute } from "@tanstack/react-router";

import {
  appendPendingSessionCookie,
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
        const { customerAccount, session } =
          await createHydrogenCustomerAuthContext({
            request,
            returnTo: "/",
          });
        const response = await customerAccount.logout({
          postLogoutRedirectUri,
        });
        return appendPendingSessionCookie(response, session);
      },
    },
  },
});
