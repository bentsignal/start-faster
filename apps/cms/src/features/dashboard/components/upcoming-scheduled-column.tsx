import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";

import { EmptyState } from "~/features/common/components/empty-state";
import { DashboardColumn } from "~/features/dashboard/components/dashboard-column";
import { DASHBOARD_LIMIT } from "~/features/dashboard/lib/dashboard-constants";
import { formatRelativeFutureTime } from "~/features/pages/lib/format-relative-time";
import { pageQueries } from "~/features/pages/lib/page-queries";

function useUpcomingScheduledColumn() {
  const { data } = useSuspenseQuery({
    ...pageQueries.listUpcomingScheduled(DASHBOARD_LIMIT),
    select: (rows) =>
      rows.map((r) => ({
        _id: r._id,
        pageId: r.pageId,
        name: r.name,
        scheduledAt: r.scheduledAt,
        pageTitle: r.pageTitle,
        pagePath: r.pagePath,
      })),
  });
  return data;
}

export function UpcomingScheduledColumn() {
  const rows = useUpcomingScheduledColumn();

  return (
    <DashboardColumn
      title="Upcoming"
      icon={<CalendarClock className="size-4" />}
    >
      {rows.length === 0 ? (
        <EmptyState text="Nothing scheduled" variant="dashboard" />
      ) : (
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li key={row._id}>
              <QuickLink
                to="/pages/$pageId/scheduled/$scheduledId"
                params={{ pageId: row.pageId, scheduledId: row._id }}
                search={{ tab: "scheduled" }}
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
                  in {formatRelativeFutureTime(row.scheduledAt)}
                </span>
              </QuickLink>
            </li>
          ))}
        </ul>
      )}
    </DashboardColumn>
  );
}
