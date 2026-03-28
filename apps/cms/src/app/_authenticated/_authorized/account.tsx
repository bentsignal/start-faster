import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { MIN_ADMIN_LEVEL } from "@acme/convex/types";
import { AccountDetails } from "@acme/features/account";

import { userQueries } from "~/lib/user-queries";

export const Route = createFileRoute("/_authenticated/_authorized/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useSuspenseQuery(userQueries.currentUser());

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:px-8">
      <AccountDetails user={user} minAdminLevel={MIN_ADMIN_LEVEL} />
    </div>
  );
}
