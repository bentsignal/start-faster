import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { getShopifyCustomerAuthState } from "~/lib/auth";

const getCustomerAuthState = createServerFn({ method: "GET" }).handler(() => {
  return getShopifyCustomerAuthState();
});

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const auth = await getCustomerAuthState();
    if (auth.isSignedIn) {
      return {
        verifiedAuth: auth,
      };
    }
    const href = `/login?returnTo=${encodeURIComponent(location.href)}`;
    throw redirect({ href });
  },
});

function RouteComponent() {
  return <Outlet />;
}
