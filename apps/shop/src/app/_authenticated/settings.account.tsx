import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@acme/ui/button";

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const name = Route.useRouteContext({
    select: (context) => context.customer.name,
  });
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Hello {name ?? "Guest"}!
      <form method="post" action="/logout">
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
}
