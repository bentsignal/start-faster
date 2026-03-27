import { createFileRoute } from "@tanstack/react-router";

import { FilesDashboardCard } from "~/features/files/components/files-dashboard-card";
import { PagesDashboardCard } from "~/features/pages/components/pages-dashboard-card";

export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
      <header>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Content Management</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            CMS Dashboard
          </h1>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <FilesDashboardCard />
        <PagesDashboardCard />
      </section>
    </div>
  );
}
