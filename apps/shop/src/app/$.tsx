import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import type { Id } from "@acme/convex/model";

import { env } from "~/env";
import { BlockRenderer } from "~/features/pages/components/block-renderer";
import { shopQueries } from "~/lib/queries";

export const Route = createFileRoute("/$")({
  validateSearch: z.object({
    draftId: z.string().optional(),
  }),
  component: RouteComponent,
  loaderDeps: ({ search }) => ({ draftId: search.draftId }),
  loader: async ({ context, params, deps }) => {
    if (deps.draftId) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Id is a branded type; the runtime value is a plain string from the URL search params
      const draftId = deps.draftId as Id<"pageDrafts">;
      await context.queryClient.ensureQueryData(
        shopQueries.getDraftPreview(draftId),
      );
      return { mode: "draft" as const, draftId };
    }

    const path = `/${params._splat}`;
    const page = await context.queryClient.fetchQuery(
      shopQueries.getByPath(path),
    );

    if (!page) {
      throw notFound();
    }

    return { mode: "page" as const, page };
  },
  head: ({ loaderData }) => {
    if (!loaderData || loaderData.mode === "draft") return {};
    return {
      meta: [
        { title: loaderData.page.title },
        {
          name: "og:title",
          content: loaderData.page.title,
        },
        {
          name: "og:url",
          content: `${env.VITE_SITE_URL}${loaderData.page.path}`,
        },
      ],
    };
  },
});

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 py-6 sm:px-8 lg:py-14">
      {children}
    </main>
  );
}

function RouteComponent() {
  const loaderData = Route.useLoaderData({
    select: (d) =>
      d.mode === "draft"
        ? { mode: d.mode, draftId: d.draftId }
        : { mode: d.mode, page: d.page },
  });

  if (loaderData.mode === "draft") {
    return <LiveDraftPreview draftId={loaderData.draftId} />;
  }

  const { page } = loaderData;
  return (
    <PageWrapper>
      <BlockRenderer blocks={page.blocks} />
    </PageWrapper>
  );
}

function LiveDraftPreview({ draftId }: { draftId: Id<"pageDrafts"> }) {
  const { data: draft } = useSuspenseQuery({
    ...shopQueries.getDraftPreview(draftId),
    select: (d) => (d ? { title: d.title, blocks: d.blocks } : null),
  });

  if (!draft) {
    return (
      <PageWrapper>
        <p className="text-muted-foreground">Draft not found</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <BlockRenderer blocks={draft.blocks} />
    </PageWrapper>
  );
}
