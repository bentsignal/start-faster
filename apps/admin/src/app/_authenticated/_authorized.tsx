import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";
import { MIN_ADMIN_LEVEL } from "@acme/convex/types";

export const Route = createFileRoute("/_authenticated/_authorized")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user.adminLevel < MIN_ADMIN_LEVEL) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { data: adminLevel } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => data.adminLevel,
  });
  if (adminLevel < MIN_ADMIN_LEVEL) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}
