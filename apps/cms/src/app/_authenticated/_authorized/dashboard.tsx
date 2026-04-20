import { createFileRoute } from "@tanstack/react-router";

import { RecentlyPublishedColumn } from "~/features/dashboard/components/recently-published-column";
import { UpcomingScheduledColumn } from "~/features/dashboard/components/upcoming-scheduled-column";
import { DASHBOARD_LIMIT } from "~/features/dashboard/lib/dashboard-constants";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: Dashboard,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        pageQueries.listUpcomingScheduled(DASHBOARD_LIMIT),
      ),
      context.queryClient.ensureQueryData(
        pageQueries.listRecentlyPublished(DASHBOARD_LIMIT),
      ),
    ]);
  },
});

function Dashboard() {
  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8">
      <section className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
        <UpcomingScheduledColumn />
        <RecentlyPublishedColumn />
      </section>
    </div>
  );
}
