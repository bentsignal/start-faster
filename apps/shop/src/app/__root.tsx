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
import { convert } from "great-time";

import { cn } from "@acme/ui";
import { Toaster } from "@acme/ui/toast";

import type { RouterContext } from "~/router";
import appStyles from "~/app/styles.css?url";
import { env } from "~/env";
import { ThemeStore } from "~/features/theme/store";
import { getTheme } from "~/features/theme/utils";
import { getShopifyCustomerAuthState } from "~/lib/auth";

const getThemeFromCookie = createServerFn({ method: "GET" }).handler(() => {
  const themeCookie = getCookie("theme");
  return getTheme(themeCookie);
});

const fetchShopifyAuth = createServerFn({ method: "GET" }).handler(() => {
  return getShopifyCustomerAuthState();
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
    const [auth, theme] = await Promise.all([
      context.queryClient.fetchQuery({
        queryKey: ["shopify-auth"],
        queryFn: fetchShopifyAuth,
        staleTime: convert(5, "minutes", "to ms"),
        gcTime: Infinity,
      }),
      context.queryClient.fetchQuery({
        queryKey: ["theme"],
        queryFn: getThemeFromCookie,
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    ]);

    return {
      auth,
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
        <QueryClientProvider client={context.queryClient}>
          <ThemeStore
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            initialTheme={context.theme}
          >
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
            <Toaster />
          </ThemeStore>
          <Scripts />
        </QueryClientProvider>
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
