import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Circle, ExternalLink } from "lucide-react";

import type { VersionState } from "@acme/convex/types";
import { api } from "@acme/convex/api";
import { QuickLink } from "@acme/features/quick-link";

import { env } from "~/env";

const EMPTY_SEARCH = {} as const;

export function PagesList() {
  const { data: pages } = useSuspenseQuery({
    ...convexQuery(api.pages.list, {}),
    select: (data) =>
      data.map((p) => ({
        _id: p._id,
        title: p.title,
        path: p.path,
        state: p.state,
        hasDraft: p.hasDraft,
      })),
  });

  // if (pages.length === 0) {
  //   return (
  //     <p className="text-muted-foreground text-sm">
  //       No pages yet. Create one to get started.
  //     </p>
  //   );
  // }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">All pages</h2>
      <div className="divide-border divide-y rounded-xl border">
        {pages.map((page) => (
          <QuickLink
            key={page._id}
            to="/pages/$pageId"
            params={{ pageId: page._id }}
            search={EMPTY_SEARCH}
            className="hover:bg-muted/50 flex items-center gap-4 px-4 py-3 transition-colors"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{page.title}</span>
              {page.path ? (
                <span className="text-muted-foreground truncate text-xs">
                  {page.path}
                </span>
              ) : null}
            </div>
            <StatusBadge state={page.state} hasDraft={page.hasDraft} />
            {page.state === "published" && page.path ? (
              <a
                href={`${env.VITE_SHOP_URL}${page.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </QuickLink>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({
  state,
  hasDraft,
}: {
  state: VersionState;
  hasDraft: boolean;
}) {
  switch (state) {
    case "published":
      return (
        <span className="bg-chart-2/15 text-chart-2 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
          <Circle className="text-chart-2 size-1.5 fill-current" />
          Published
          {hasDraft ? (
            <span className="text-muted-foreground text-[10px]">+ draft</span>
          ) : null}
        </span>
      );
    case "draft":
      return (
        <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
          <Circle className="text-muted-foreground size-1.5 fill-current" />
          Draft
        </span>
      );
    default: {
      const _exhaustive: never = state;
      throw new Error(`Unhandled state: ${String(_exhaustive)}`);
    }
  }
}
