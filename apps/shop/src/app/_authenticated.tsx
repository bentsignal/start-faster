import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: ({ location, context }) => {
    if (context.auth.isSignedIn) {
      return {
        accessToken: context.auth.accessToken,
        customer: context.auth.customer,
      };
    }
    const href = `/login?returnTo=${encodeURIComponent(location.href)}`;
    throw redirect({ href });
  },
});

function RouteComponent() {
  return <Outlet />;
}
