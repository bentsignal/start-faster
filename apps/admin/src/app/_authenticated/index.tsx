import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { MIN_ADMIN_LEVEL } from "@acme/convex/types";

import { SignOutButton } from "~/components/sign-out-button";
import { adminQueries } from "~/lib/queries";

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
    ...adminQueries.currentUser(),
    select: (data) => data.adminLevel,
  });
  if (adminLevel >= MIN_ADMIN_LEVEL) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Loader className="size-4 animate-spin" />
        <h1 className="text-base font-medium">Waiting for access</h1>
        <p className="text-muted-foreground max-w-xs text-sm">
          An admin needs to approve your account before you can continue.
        </p>
      </div>
      <SignOutButton />
    </main>
  );
}
