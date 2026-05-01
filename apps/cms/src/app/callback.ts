import { createFileRoute } from "@tanstack/react-router";
import { handleCallbackRoute } from "@workos/authkit-tanstack-react-start";

import { appUrls } from "~/urls";

const workosHandler = handleCallbackRoute();

export const Route = createFileRoute("/callback")({
  server: {
    handlers: {
      // Portless proxies requests to 127.0.0.1:PORT, so the WorkOS handler
      // would redirect to that raw address. Fix by rewriting the origin.
      GET: async (ctx) => {
        const siteUrl = new URL(appUrls.cms);
        const requestUrl = new URL(ctx.request.url);
        requestUrl.protocol = siteUrl.protocol;
        requestUrl.hostname = siteUrl.hostname;
        requestUrl.port = siteUrl.port;

        return workosHandler({
          ...ctx,
          request: new Request(requestUrl.toString(), ctx.request),
        });
      },
    },
  },
});
