import { createFileRoute } from "@tanstack/react-router";

import { handler } from "~/features/auth/lib/server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handler(request);
      },
      POST: async ({ request }) => {
        return handler(request);
      },
    },
  },
});
