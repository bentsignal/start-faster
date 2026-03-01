import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { Error } from "~/components/error";
import { NotFound } from "~/components/not-found";
import { Pending } from "~/components/pending";
import { cartMutationKeys } from "~/features/cart/lib/cart-queries";
import { routeTree } from "./routeTree.gen";

export interface RouterContext {
  queryClient: QueryClient;
}

function mutationRetryDelay(attemptIndex: number) {
  return Math.min(1000 * 2 ** attemptIndex, 30_000);
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  queryClient.setMutationDefaults(cartMutationKeys.lineAll, {
    retry: 3,
    retryDelay: mutationRetryDelay,
  });

  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    context: {
      queryClient,
    },
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: Error,
    defaultPendingComponent: Pending,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
