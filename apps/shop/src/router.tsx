import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import { Error } from "~/components/error";
import { NotFound } from "~/components/not-found";
import { Pending } from "~/components/pending";
import { env } from "~/env";
import { handleCartMutationCacheEvent } from "~/features/cart/lib/cart-cache-sync";
import { cartMutations } from "~/features/cart/lib/cart-mutations";
import { routeTree } from "./routeTree.gen";

export interface RouterContext {
  convex: ConvexReactClient;
  queryClient: QueryClient;
}

function mutationRetryDelay(attemptIndex: number) {
  return Math.min(1000 * 2 ** attemptIndex, 30_000);
}

export function getRouter() {
  const convex = new ConvexReactClient(env.VITE_CONVEX_URL);
  const convexQueryClient = new ConvexQueryClient(convex);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  queryClient.getMutationCache().subscribe((event) => {
    handleCartMutationCacheEvent(event, queryClient);
  });

  queryClient.setMutationDefaults(cartMutations.lineAll().mutationKey, {
    retry: 3,
    retryDelay: mutationRetryDelay,
  });

  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      convex,
      queryClient,
    },
    Wrap: ({ children }) => (
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    ),
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
