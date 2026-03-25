import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";

import { api } from "@acme/convex/api";

import { adminQueries } from "~/lib/queries";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const auth = context.auth;
    if (auth.isSignedIn === false) {
      const path = location.pathname;
      const href = await getSignInUrl({ data: { returnPathname: path } });
      throw redirect({ href });
    }

    // if user has never signed in before, a new user record in convex
    // will be created with created for them
    try {
      await context.convexQueryClient.serverHttpClient?.mutation(
        api.users.ensureUserExists,
        {},
      );
    } catch (error) {
      console.error(error);
      throw new Error("Failed to ensure user exists");
    }

    const currentUser = await context.queryClient.ensureQueryData(
      adminQueries.currentUser(),
    );
    return {
      auth,
      user: currentUser,
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
