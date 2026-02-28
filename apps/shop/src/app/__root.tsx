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
import { convert } from "great-time";
import { z } from "zod";

import { Toaster } from "@acme/ui/toaster";
import { cn } from "@acme/ui/utils";

import type { RouterContext } from "~/router";
import appStyles from "~/app/styles.css?url";
import { LoginModal } from "~/components/auth/login-modal";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header/header";
import { MailingList } from "~/components/mailing-list";
import { env } from "~/env";
import { CartSheet } from "~/features/cart/components/cart-sheet";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import { getCartFromCookie } from "~/features/cart/server/cart-cookie";
import { CartStore } from "~/features/cart/store";
import { getThemeFromCookie } from "~/features/theme/server/theme-cookie";
import { ThemeStore } from "~/features/theme/store";
import { getShopifyCustomerAuthState } from "~/lib/auth";

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
    const [auth, theme, cart] = await Promise.all([
      context.queryClient.fetchQuery({
        queryKey: ["shopify-auth"],
        queryFn: fetchShopifyAuth,
        staleTime: convert(50, "minutes", "to ms"),
        gcTime: Infinity,
      }),
      context.queryClient.fetchQuery({
        queryKey: ["theme"],
        queryFn: getThemeFromCookie,
        staleTime: Infinity,
        gcTime: Infinity,
      }),
      context.queryClient.fetchQuery({
        queryKey: ["cart"],
        queryFn: getCartFromCookie,
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    ]);

    return {
      auth,
      theme,
      cart,
    };
  },
  loader: async ({ context }) => {
    if (context.cart.id !== null) {
      await context.queryClient.fetchQuery({
        ...cartQueries.detail(context.cart.id),
      });
    }
  },
  validateSearch: z.object({
    showLogin: z.boolean().optional(),
    returnTo: z.string().optional(),
  }),
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
          <CartStore initialCart={context.cart}>
            <ThemeStore
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
              initialTheme={context.theme}
            >
              <Header />
              <CartSheet />
              <LoginModal />
              <Outlet />
              <MailingList />
              <Footer />
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
          </CartStore>
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
