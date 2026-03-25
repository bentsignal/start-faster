import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

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
    <main className="bg-background min-h-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-6 py-10 sm:px-8">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
        </header>

        <UserSearchInput />
        <UserAccessList />
      </div>
    </main>
  );
}
