import { QueryClient } from "@tanstack/react-query";
import { createRouter, Link } from "@tanstack/react-router";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexReactClient } from "convex/react";
import { House } from "lucide-react";

import { Button } from "@acme/ui/button";

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
  return createRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      convex,
      queryClient,
      convexQueryClient,
    },
    defaultErrorComponent: (props) => {
      console.error(props.error);
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Sorry about that</h1>
          <p className="text-muted-foreground">
            Something went wrong while loading this page.
          </p>
          <Button asChild className="mt-1">
            <Link to="/">
              <House className="size-4" />
              Back to home
            </Link>
          </Button>
        </div>
      );
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
