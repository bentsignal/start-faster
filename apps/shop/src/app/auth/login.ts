import { createFileRoute } from "@tanstack/react-router";

import { createCustomerLogin } from "~/lib/auth";
import { env } from "~/env";

export const Route = createFileRoute("/auth/login")({
  server: {
    handlers: {
      GET: ({ request }) => {
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
        const returnTo = url.searchParams.get("returnTo") ?? "/";
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
