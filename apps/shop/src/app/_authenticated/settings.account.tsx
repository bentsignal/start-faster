import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = Route.useRouteContext({ select: (context) => context.auth });
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Hello "/settings/account"! {auth.customer?.email}
    </div>
  );
}
