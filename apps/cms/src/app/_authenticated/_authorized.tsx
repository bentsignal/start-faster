import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export const Route = createFileRoute("/_authenticated/_authorized")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user.cmsScopes.length === 0) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { data: cmsScopes } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => data.cmsScopes,
  });
  if (cmsScopes.length === 0) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}
