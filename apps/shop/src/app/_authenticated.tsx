import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import {
  createCustomerLoginUrl,
  getShopifyCustomerAuthState,
} from "~/lib/auth";

const getCustomerAuthState = createServerFn({ method: "GET" }).handler(() => {
  return getShopifyCustomerAuthState();
});

const getCustomerLoginUrl = createServerFn({ method: "GET" })
  .inputValidator((value: unknown) => {
    if (
      typeof value !== "object" ||
      value === null ||
      !("returnTo" in value) ||
      typeof value.returnTo !== "string"
    ) {
      throw new Error("Expected a returnTo string.");
    }

    return {
      returnTo: value.returnTo,
    };
  })
  .handler(({ data }) => {
    return createCustomerLoginUrl(data.returnTo);
  });

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const auth = await getCustomerAuthState();
    if (auth.isSignedIn) {
      return;
    }

    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    const href = await getCustomerLoginUrl({
      data: {
        returnTo,
      },
    });

    throw redirect({ href });
  },
});

function RouteComponent() {
  return <Outlet />;
}
