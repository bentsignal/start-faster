import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";

import { api } from "@acme/convex/api";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const auth = context.auth;
    if (auth.isSignedIn === false) {
      const path = location.pathname;
      const href = await getSignInUrl({ data: { returnPathname: path } });
      throw redirect({ href });
    }
    const currentUser = await context.queryClient.ensureQueryData(
      convexQuery(api.users.getCurrentUser, {}),
    );
    return {
      user: auth.user,
      accessLevel: currentUser?.accessLevel,
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
