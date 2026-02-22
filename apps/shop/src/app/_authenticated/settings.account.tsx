import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@acme/ui/button";

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const customer = Route.useRouteContext({
    select: (context) => context.customer,
  });
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Hello "/settings/account"!
      {customer.email}
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
