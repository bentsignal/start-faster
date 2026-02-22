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
    throw redirect({
      to: "/",
      search: { showLogin: true, returnTo: encodeURIComponent(location.href) },
    });
  },
});

function RouteComponent() {
  return <Outlet />;
}
