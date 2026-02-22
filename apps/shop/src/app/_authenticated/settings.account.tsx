import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@acme/ui/button";

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = Route.useRouteContext({
    select: (context) => context.verifiedAuth,
  });
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Hello "/settings/account"!
      {auth.customer.email}
      <Button
        render={(props) => (
          <a href="/logout" {...props}>
            Logout
          </a>
        )}
      />
    </div>
  );
}
