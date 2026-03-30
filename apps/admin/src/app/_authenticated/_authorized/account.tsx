import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { MIN_ADMIN_LEVEL } from "@acme/convex/types";
import { AccountDetails } from "@acme/features/account";

import { adminQueries } from "~/lib/queries";

export const Route = createFileRoute("/_authenticated/_authorized/account")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(adminQueries.currentUser());
  },
});

function RouteComponent() {
  const { data: user } = useSuspenseQuery({
    ...adminQueries.currentUser(),
    select: (data) => ({
      name: data.name,
      email: data.email,
      adminLevel: data.adminLevel,
      cmsScopes: data.cmsScopes,
    }),
  });

  return (
    <main className="bg-background min-h-full">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:px-8">
        <AccountDetails user={user} minAdminLevel={MIN_ADMIN_LEVEL} />
      </div>
    </main>
  );
}
