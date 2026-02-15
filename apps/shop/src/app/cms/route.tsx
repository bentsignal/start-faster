import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cms")({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    const pathname = location.pathname;
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/",
        search: (prev) => ({
          ...prev,
          showLogin: true,
          redirect_uri: pathname,
        }),
      });
    }
  },
});

function RouteComponent() {
  return (
    <div>
      <h1>CMS</h1>
      <Outlet />
    </div>
  );
}
