import { createFileRoute } from "@tanstack/react-router";

import {
  appendPendingSessionCookie,
  createHydrogenCustomerAuthContext,
  isTrustedCustomerAuthRequest,
  withCustomerAuthOrigin,
} from "~/lib/auth";
import { shopifyCustomerLogoutRedirectUri } from "~/urls";

export const Route = createFileRoute("/_auth/logout")({
  server: {
    handlers: {
      POST: async ({ request: rawRequest }) => {
        const request = withCustomerAuthOrigin(rawRequest);
        if (!isTrustedCustomerAuthRequest(request)) {
          return new Response("Invalid auth request origin.", { status: 403 });
        }
        const { customerAccount, session } =
          await createHydrogenCustomerAuthContext({
            request,
            returnTo: "/",
          });
        const response = await customerAccount.logout({
          postLogoutRedirectUri: shopifyCustomerLogoutRedirectUri,
        });
        return appendPendingSessionCookie(response, session);
      },
    },
  },
});
