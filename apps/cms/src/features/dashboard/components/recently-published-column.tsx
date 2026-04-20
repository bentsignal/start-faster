import { useSuspenseQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";

import { EmptyState } from "~/features/common/components/empty-state";
import { DashboardColumn } from "~/features/dashboard/components/dashboard-column";
import { DASHBOARD_LIMIT } from "~/features/dashboard/lib/dashboard-constants";
import { formatTimeAgo } from "~/features/pages/lib/format-relative-time";
import { pageQueries } from "~/features/pages/lib/page-queries";

function useRecentlyPublishedColumn() {
  const { data } = useSuspenseQuery({
    ...pageQueries.listRecentlyPublished(DASHBOARD_LIMIT),
    select: (rows) =>
      rows.map((r) => ({
        _id: r._id,
        pageId: r.pageId,
        name: r.name,
        publishedAt: r.publishedAt,
        pageTitle: r.pageTitle,
        pagePath: r.pagePath,
      })),
  });
  return data;
}

export function RecentlyPublishedColumn() {
  const rows = useRecentlyPublishedColumn();

  return (
    <DashboardColumn
      title="Recently published"
      icon={<Upload className="size-4" />}
    >
      {rows.length === 0 ? (
        <EmptyState text="Nothing published yet" variant="dashboard" />
      ) : (
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li key={row._id}>
              <QuickLink
                to="/pages/$pageId/release/$releaseId"
                params={{ pageId: row.pageId, releaseId: row._id }}
                search={{ tab: "published" }}
                className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {row.pageTitle}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {row.name}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {formatTimeAgo(row.publishedAt)}
                </span>
              </QuickLink>
            </li>
          ))}
        </ul>
      )}
    </DashboardColumn>
  );
}
