import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import type { Id } from "@acme/convex/model";

import { env } from "~/env";
import { shopQueries } from "~/lib/queries";

export const Route = createFileRoute("/$")({
  validateSearch: z.object({
    draftId: z.string().optional(),
  }),
  component: CmsPage,
  loaderDeps: ({ search }) => ({ draftId: search.draftId }),
  loader: async ({ context, params, deps }) => {
    if (deps.draftId) {
      // No harm in asserting the type here as pageDrafts id
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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

function CmsPage() {
  const loaderData = Route.useLoaderData();

  if (loaderData.mode === "draft") {
    return <LiveDraftPreview draftId={loaderData.draftId} />;
  }

  return <StaticPage page={loaderData.page} />;
}

function StaticPage({
  page,
}: {
  page: { title: string; path: string; content: string };
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
      <p className="text-foreground/80 mt-6 leading-relaxed whitespace-pre-wrap">
        {page.content}
      </p>
    </main>
  );
}

function LiveDraftPreview({ draftId }: { draftId: Id<"pageDrafts"> }) {
  const { data: draft } = useSuspenseQuery(
    shopQueries.getDraftPreview(draftId),
  );

  if (!draft) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8">
        <p className="text-muted-foreground">Draft not found</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{draft.title}</h1>
      <p className="text-foreground/80 mt-6 leading-relaxed whitespace-pre-wrap">
        {draft.content}
      </p>
    </main>
  );
}
