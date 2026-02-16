import { createFileRoute } from "@tanstack/react-router";

import { handler } from "~/features/auth/lib/server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        console.log("GET");
        console.log(request);
        const response = await handler(request);
        console.log(response);
        return response;
      },
      POST: async ({ request }) => {
        console.log("POST");
        console.log(request);
        const response = await handler(request);
        console.log(response);
        return response;
      },
    },
  },
});
