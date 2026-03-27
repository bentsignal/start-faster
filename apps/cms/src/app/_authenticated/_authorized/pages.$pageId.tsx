import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { z } from "zod";

import type { Id } from "@acme/convex/model";
import { api } from "@acme/convex/api";

import { PageEditor } from "~/features/pages/components/page-editor";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId",
)({
  component: RouteComponent,
  validateSearch: z.object({
    versionId: z.string().optional(),
  }),
  beforeLoad: ({ params }) => {
    const pageId = params.pageId as Id<"pages">;
    return { pageId };
  },
  loader: async ({ context }) => {
    const [_page, versions] = await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.pages.getById, { pageId: context.pageId }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.pages.listVersions, { pageId: context.pageId }),
      ),
    ]);
    if (versions.length === 0) {
      throw new Error("No versions found");
    }
  },
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:px-8">
      <PageEditor />
    </div>
  );
}
