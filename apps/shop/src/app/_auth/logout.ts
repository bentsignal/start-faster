import { createFileRoute } from "@tanstack/react-router";

import {
  createCustomerLogout,
  isTrustedCustomerAuthRequest,
} from "~/lib/auth";

export const Route = createFileRoute("/_auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isTrustedCustomerAuthRequest(request)) {
          return new Response("Invalid auth request origin.", { status: 403 });
        }

        const formData = await request.formData();
        const returnTo =
          typeof formData.get("returnTo") === "string"
            ? (formData.get("returnTo") as string)
            : "/";
        const { logoutUrl, cookies } = createCustomerLogout({
          request,
          returnTo,
        });
        const headers = new Headers();
        headers.set("location", logoutUrl);
        for (const cookie of cookies) {
          headers.append("set-cookie", cookie);
        }
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
