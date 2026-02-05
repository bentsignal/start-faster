import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod/v4";

import * as Search from "~/features/search/atom";
import { SearchPageResults } from "~/features/search/molecules/search-page-results";
import { MainLayout } from "~/layouts/main";

export const Route = createFileRoute("/_tabs/search")({
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/",
        search: { showLogin: true, redirectTo: "/search" },
      });
    }
  },
  component: SearchPage,
});

function SearchPage() {
  const q = Route.useSearch({ select: (s) => s.q });

  return (
    <Search.Store initialSearchTerm={q} storeSearchTermInURL={true}>
      <MainLayout className="max-h-screen overflow-hidden">
        <SearchPageResults />
      </MainLayout>
    </Search.Store>
  );
}
