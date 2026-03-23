import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { Loader } from "lucide-react";

import { api } from "@acme/convex/api";

import { SignOutButton } from "~/components/sign-out-button";

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: ({ context }) => {
    if (context.user.cmsScopes.length > 0) {
      throw redirect({ href: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: cmsScopes } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => data.cmsScopes,
  });
  if (cmsScopes.length > 0) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Loader className="size-4 animate-spin" />
        <h1 className="text-base font-medium">Waiting for access</h1>
        <p className="text-muted-foreground max-w-xs text-sm">
          An admin needs to grant you CMS permissions before you can continue.
        </p>
      </div>
      <SignOutButton />
    </main>
  );
}
