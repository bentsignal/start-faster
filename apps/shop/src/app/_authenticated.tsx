import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const auth = context.auth;
    if (auth.isSignedIn === false) {
      const path = location.pathname;
      const href = await getSignInUrl({ data: { returnPathname: path } });
      throw redirect({ href });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
