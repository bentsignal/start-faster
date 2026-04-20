import { Activity, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { z } from "zod";

import { Input } from "@acme/ui/input";

import type { PagesViewMode } from "~/features/pages/components/pages-view-toggle";
import { CreatePageButton } from "~/features/pages/components/create-page";
import { PagesListView } from "~/features/pages/components/pages-list-view";
import { PagesTreeView } from "~/features/pages/components/pages-tree-view";
import {
  defaultPagesViewMode,
  pagesViewModeValidator,
  PagesViewToggle,
} from "~/features/pages/components/pages-view-toggle";
import { pageQueries } from "~/features/pages/lib/page-queries";
import { useDebouncedInput } from "~/hooks/use-debounced-input";

export const Route = createFileRoute("/_authenticated/_authorized/pages/")({
  component: RouteComponent,
  validateSearch: z.object({
    view: pagesViewModeValidator.default(defaultPagesViewMode),
    q: z.string().default(""),
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(pageQueries.listFirstPage(deps.q)),
      context.queryClient.ensureQueryData(pageQueries.list()),
    ]);
  },
  shouldReload: false,
});

function usePagesIndex() {
  const viewMode = Route.useSearch({ select: (s) => s.view });
  const urlQuery = Route.useSearch({ select: (s) => s.q });
  const navigate = Route.useNavigate();

  async function setViewMode(next: PagesViewMode) {
    await navigate({
      search: (prev) => ({ ...prev, view: next }),
      replace: true,
    });
  }

  const {
    value: searchValue,
    setValue: setSearchValue,
    debouncedValue: debouncedSearch,
  } = useDebouncedInput({ initialValue: urlQuery });

  // eslint-disable-next-line no-restricted-syntax -- sync debounced input into URL search params
  useEffect(() => {
    void navigate({
      search: (prev) => ({ ...prev, q: debouncedSearch || undefined }),
      replace: true,
    });
  }, [debouncedSearch, navigate]);

  return { viewMode, setViewMode, searchValue, setSearchValue };
}

function RouteComponent() {
  const { viewMode, setViewMode, searchValue, setSearchValue } =
    usePagesIndex();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10 sm:px-8">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search pages by title or path..."
            className="pl-9"
          />
        </div>
        <CreatePageButton />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">All pages</h2>
        <PagesViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <Activity mode={viewMode === "list" ? "visible" : "hidden"}>
        <PagesListView />
      </Activity>
      <Activity mode={viewMode === "tree" ? "visible" : "hidden"}>
        <PagesTreeView />
      </Activity>
    </div>
  );
}
