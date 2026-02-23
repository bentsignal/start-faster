import { createFileRoute } from "@tanstack/react-router";

import {
  appendPendingSessionCookie,
  createHydrogenCustomerAuthContext,
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
        const { customerAccount, session } =
          await createHydrogenCustomerAuthContext({ request });
        const response = await customerAccount.authorize();
        return appendPendingSessionCookie(response, session);
      },
    },
  },
});
