import { createFileRoute } from "@tanstack/react-router";

import { SignOutButton } from "~/components/sign-out-button";
import { FilesDashboardCard } from "~/features/files/components/files-dashboard-card";
import { filesQueries } from "~/features/files/lib/queries";

export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(filesQueries.currentUser());
  },
});

function RouteComponent() {
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Content Management</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              CMS Dashboard
            </h1>
          </div>
          <SignOutButton />
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <FilesDashboardCard />
        </section>
      </div>
    </main>
  );
}
