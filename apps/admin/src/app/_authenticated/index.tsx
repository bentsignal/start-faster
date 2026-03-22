import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { Loader } from "lucide-react";

import { api } from "@acme/convex/api";
import { MIN_ADMIN_LEVEL } from "@acme/convex/types";
import { Card } from "@acme/ui/card";

import { SignOutButton } from "~/components/sign-out-button";

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: ({ context }) => {
    if (context.user.adminLevel >= MIN_ADMIN_LEVEL) {
      throw redirect({ href: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: adminLevel } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => data.adminLevel,
  });
  if (adminLevel >= MIN_ADMIN_LEVEL) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold">Admin Portal</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your account needs approval from an admin before dashboard access is
            granted.
          </p>

          <div className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-sm">
            <Loader className="size-4 animate-spin" />
            Waiting for approval...
          </div>

          <div className="mt-8 flex justify-center">
            <SignOutButton />
          </div>
        </Card>
      </div>
    </main>
  );
}
