import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import { SignOutButton } from "~/components/sign-out-button";
import { UserAccessList } from "~/features/user-access/components/user-access-list";
import { UserSearchInput } from "~/features/user-access/components/user-search-input";
import { sanitizeSearch } from "~/features/user-access/lib/sanitize-search";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";

export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: DashboardRoute,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      userAccessQueries.searchFirstPage(sanitizeSearch(deps.q)),
    );
  },
  shouldReload: false,
  validateSearch: z.object({
    q: z.string().optional(),
  }),
});

function DashboardRoute() {
  return (
    <main className="bg-background min-h-screen">
      <div className="container py-10">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin Portal</h1>
            <p className="text-muted-foreground text-sm">
              Manage access for users in your admin workspace.
            </p>
          </div>
          <SignOutButton />
        </header>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>User Access</CardTitle>
            <UserSearchInput />
          </CardHeader>
          <CardContent>
            <UserAccessList />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
