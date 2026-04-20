import { createFileRoute } from "@tanstack/react-router";

import { CreatePageButton } from "~/features/pages/components/create-page";
import { PagesList } from "~/features/pages/components/pages-list";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute("/_authenticated/_authorized/pages/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(pageQueries.list());
  },
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8">
      <CreatePageButton />
      <PagesList />
    </div>
  );
}
