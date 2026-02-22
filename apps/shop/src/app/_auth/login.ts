import { createFileRoute } from "@tanstack/react-router";

import { env } from "~/env";
import { createCustomerLogin, isTrustedCustomerAuthRequest } from "~/lib/auth";

export const Route = createFileRoute("/_auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const callbackOrigin = new URL(
          env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI,
        ).origin;
        if (url.origin !== callbackOrigin) {
          return new Response(
            `Auth origin mismatch. Open this app on ${callbackOrigin} while using Shopify customer auth.`,
            { status: 400 },
          );
        }

        if (!isTrustedCustomerAuthRequest(request)) {
          return new Response("Invalid auth request origin.", { status: 403 });
        }

        const formData = await request.formData();
        const returnTo =
          typeof formData.get("returnTo") === "string"
            ? (formData.get("returnTo") as string)
            : "/";

        const { authorizeUrl, oauthCookie } = createCustomerLogin({
          request,
          returnTo,
        });

        return new Response(null, {
          status: 302,
          headers: new Headers({
            location: authorizeUrl,
            "set-cookie": oauthCookie,
          }),
        });
      },
    },
  },
});
