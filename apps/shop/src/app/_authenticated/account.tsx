import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

export const Route = createFileRoute("/_authenticated/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const customer = Route.useRouteContext({
    select: (context) => context.customer,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              Name
            </dt>
            <dd className="text-base font-medium">{customer.name}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              Email
            </dt>
            <dd className="text-base font-medium">{customer.email}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
