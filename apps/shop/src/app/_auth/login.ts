import { createFileRoute } from "@tanstack/react-router";

import {
  appendPendingSessionCookie,
  createHydrogenCustomerAuthContext,
  isTrustedCustomerAuthRequest,
  withCustomerAuthOrigin,
} from "~/lib/auth";
import { shopifyCustomerRedirectUri } from "~/urls";

export const Route = createFileRoute("/_auth/login")({
  server: {
    handlers: {
      POST: async ({ request: rawRequest }) => {
        const request = withCustomerAuthOrigin(rawRequest);
        const url = new URL(request.url);
        const callbackOrigin = new URL(shopifyCustomerRedirectUri).origin;
        if (url.origin !== callbackOrigin) {
          return new Response("Auth origin mismatch.", { status: 400 });
        }

        if (!isTrustedCustomerAuthRequest(request)) {
          return new Response("Invalid auth request origin.", { status: 403 });
        }

        const formData = await request.formData();
        const rawReturnTo = formData.get("returnTo");
        const returnTo = typeof rawReturnTo === "string" ? rawReturnTo : "/";
        const { customerAccount, session } =
          await createHydrogenCustomerAuthContext({
            request,
            returnTo,
          });
        const response = await customerAccount.login();
        return appendPendingSessionCookie(response, session);
      },
    },
  },
});
