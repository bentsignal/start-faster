import { createFileRoute } from "@tanstack/react-router";

import { env } from "~/env";
import {
  appendPendingSessionCookie,
  createHydrogenCustomerAuthContext,
  isTrustedCustomerAuthRequest,
  withSiteOrigin,
} from "~/lib/auth";

export const Route = createFileRoute("/_auth/logout")({
  server: {
    handlers: {
      POST: async ({ request: rawRequest }) => {
        const request = withSiteOrigin(rawRequest);
        if (!isTrustedCustomerAuthRequest(request)) {
          return new Response("Invalid auth request origin.", { status: 403 });
        }
        const postLogoutRedirectUri =
          env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI;
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
