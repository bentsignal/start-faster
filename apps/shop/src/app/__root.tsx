import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { convert } from "great-time";

import { cn } from "@acme/ui";
import { Toaster } from "@acme/ui/toast";

import type { RouterContext } from "~/router";
import appStyles from "~/app/styles.css?url";
import { env } from "~/env";
import { authClient } from "~/features/auth/lib/client";
import { getToken } from "~/features/auth/lib/server";
import { AuthStore } from "~/features/auth/store";
import { ThemeStore } from "~/features/theme/store";
import { getTheme } from "~/features/theme/utils";

const getThemeFromCookie = createServerFn({ method: "GET" }).handler(() => {
  const themeCookie = getCookie("theme");
  return {
    theme: getTheme(themeCookie),
  };
});

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  return await getToken();
});

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    links: [{ rel: "stylesheet", href: appStyles }],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Start Faster" },
      {
        name: "description",
        content: "The fastest shopping experience you've ever seen.",
      },
      {
        name: "theme-color",
        content: "white",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "black",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const token = await context.queryClient.fetchQuery({
      queryKey: ["auth-token"],
      queryFn: async () => (await getAuth()) ?? null,
      staleTime: convert(50, "minutes", "to ms"),
      gcTime: Infinity,
    });
    // all queries, mutations and actions through TanStack Query will be
    // authenticated during SSR if we have a valid token
    if (token) {
      // During SSR only (the only time serverHttpClient exists),
      // set the auth token to make HTTP queries with.
      context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    const { theme } = await context.queryClient.fetchQuery({
      queryKey: ["theme"],
      queryFn: async () => await getThemeFromCookie(),
      staleTime: Infinity,
      gcTime: Infinity,
    });

    return {
      isAuthenticated: !!token,
      token,
      theme,
    };
  },
  component: RootComponent,
});

function RootComponent() {
  const context = Route.useRouteContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <ReactScan />
      </head>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
        )}
      >
        <ConvexBetterAuthProvider
          client={context.convex}
          authClient={authClient}
          initialToken={context.token}
        >
          <QueryClientProvider client={context.queryClient}>
            <ThemeStore
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
              initialTheme={context.theme}
            >
              <AuthStore isAuthenticatedServerSide={context.isAuthenticated}>
                <Outlet />
                <TanStackDevtools
                  config={{
                    position: "bottom-right",
                  }}
                  plugins={[
                    {
                      name: "react-router",
                      render: <TanStackRouterDevtoolsPanel />,
                    },
                  ]}
                />
              </AuthStore>
              <Toaster />
            </ThemeStore>
            <Scripts />
          </QueryClientProvider>
        </ConvexBetterAuthProvider>
      </body>
    </html>
  );
}

function ReactScan() {
  if (env.VITE_NODE_ENV !== "development") {
    return null;
  }
  return (
    <script
      crossOrigin="anonymous"
      src="//unpkg.com/react-scan/dist/auto.global.js"
    />
  );
}
