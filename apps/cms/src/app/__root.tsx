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
import { getAuth } from "@workos/authkit-tanstack-react-start";
import { convert } from "great-time";

import {
  DEFAULT_THEME,
  getThemeFromCookie,
  ThemeStore,
} from "@acme/features/theme";
import { Toaster } from "@acme/ui/toaster";
import { cn } from "@acme/ui/utils";

import type { RouterContext } from "~/router";
import appStyles from "~/app/styles.css?url";
import { env } from "~/env";

const fetchWorkosAuth = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await getAuth();
  const user = auth.user;
  return user
    ? {
        user,
        token: auth.accessToken,
        isSignedIn: true,
      }
    : {
        user: null,
        token: null,
        isSignedIn: false,
      };
});

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    links: [{ rel: "stylesheet", href: appStyles }],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CMS – Start Faster" },
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
        queryKey: ["workos-auth"],
        queryFn: async () => await fetchWorkosAuth(),
        staleTime: convert(50, "minutes", "to ms"),
        gcTime: Infinity,
      }),
      context.queryClient.fetchQuery({
        queryKey: ["theme"],
        queryFn: async () => await getThemeFromCookie(),
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    ]);
    // all queries, mutations and actions through TanStack Query will be
    // authenticated during SSR if we have a valid token
    if (auth.isSignedIn) {
      // During SSR only (the only time serverHttpClient exists),
      // set the auth token to make HTTP queries with.
      context.convexQueryClient.serverHttpClient?.setAuth(auth.token);
    }

    const { token: _, ...rest } = auth;

    return {
      auth: rest,
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
            defaultTheme={DEFAULT_THEME}
            disableTransitionOnChange
            initialTheme={context.theme}
          >
            <Outlet />
            <TanStackDevtools
              config={{
                position: "bottom-right",
                inspectHotkey: ["Control", "Shift", "I"],
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
