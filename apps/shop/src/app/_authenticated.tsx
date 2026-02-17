import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    const auth = context.auth;
    if (auth.isSignedIn === false) {
      const path = location.pathname;
      const href = `/auth/login?returnTo=${encodeURIComponent(path)}`;
      throw redirect({ href });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
