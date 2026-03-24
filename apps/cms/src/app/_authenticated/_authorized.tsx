import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { hasCmsAccess } from "@acme/convex/privileges";

import { filesQueries } from "~/features/files/lib/queries";

export const Route = createFileRoute("/_authenticated/_authorized")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!hasCmsAccess(context.user)) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { data: hasAccess } = useSuspenseQuery({
    ...filesQueries.currentUser(),
    select: (data) => hasCmsAccess(data),
  });
  if (!hasAccess) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}
