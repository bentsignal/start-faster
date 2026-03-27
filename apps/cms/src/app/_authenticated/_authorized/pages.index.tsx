import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

import { CreatePageButton } from "~/features/pages/components/create-page-button";
import { PagesHeader } from "~/features/pages/components/pages-header";
import { PagesList } from "~/features/pages/components/pages-list";

export const Route = createFileRoute("/_authenticated/_authorized/pages/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(convexQuery(api.pages.list, {}));
  },
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8">
      <PagesHeader />
      <CreatePageButton />
      <PagesList />
    </div>
  );
}
