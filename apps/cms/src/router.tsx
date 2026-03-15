import { useCallback, useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from "@workos/authkit-tanstack-react-start/client";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";

import { Error } from "~/components/error";
import { NotFound } from "~/components/not-found";
import { Pending } from "~/components/pending";
import { env } from "~/env";
import { routeTree } from "./routeTree.gen";

export interface RouterContext {
  convex: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
  queryClient: QueryClient;
}

export function getRouter() {
  const convex = new ConvexReactClient(env.VITE_CONVEX_URL, {
    expectAuth: true,
  });
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
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: {
      convex,
      queryClient,
      convexQueryClient,
    },
    Wrap: ({ children }) => (
      <AuthKitProvider>
        <ConvexProviderWithAuth client={convex} useAuth={useAuthFromWorkOS}>
          {children}
        </ConvexProviderWithAuth>
      </AuthKitProvider>
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

function useAuthFromWorkOS() {
  const { loading, user } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) {
        return null;
      }
      if (forceRefreshToken) {
        return (await refresh()) ?? null;
      }
      return (await getAccessToken()) ?? null;
    },
    [user, refresh, getAccessToken],
  );

  return useMemo(
    () => ({
      isLoading: loading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [loading, user, fetchAccessToken],
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
