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
    if (context.accessLevel !== "authorized") {
      throw redirect({ to: "/" });
    }
    return {
      accessLevel: context.accessLevel,
    };
  },
});

function RouteComponent() {
  const user = useSuspenseQuery(convexQuery(api.users.getCurrentUser, {}));
  if (user.data?.accessLevel !== "authorized") {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}
