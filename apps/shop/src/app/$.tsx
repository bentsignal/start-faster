import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { toId } from "@acme/convex/ids";
import { FALLBACK_IMAGE } from "@acme/features/heroes";

import { env } from "~/env";
import { BlockRenderer } from "~/features/pages/components/block-renderer";
import { DraftPreview } from "~/features/pages/components/draft-preview";
import { PageWrapper } from "~/features/pages/components/page-wrapper";
import { ReleasePreview } from "~/features/pages/components/release-preview";
import { ScheduledPreview } from "~/features/pages/components/scheduled-preview";
import { prefetchBlockData } from "~/features/pages/lib/prefetch-blocks";
import { shopQueries } from "~/lib/queries";
import { buildSeoHead, defaultSeoDescription } from "~/lib/seo";

export const Route = createFileRoute("/$")({
  validateSearch: z.object({
    draftId: z.string().optional(),
    scheduledId: z.string().optional(),
    releaseId: z.string().optional(),
  }),
  component: RouteComponent,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    if (deps.draftId) {
      const draftId = toId<"pageDrafts">(deps.draftId);
      const draft = await context.queryClient.ensureQueryData(
        shopQueries.getDraftPreview(draftId),
      );
      if (!draft) throw notFound();
      await prefetchBlockData(context.queryClient, draft.blocks);
      return { mode: "draft" as const, draftId };
    }

    if (deps.scheduledId) {
      const scheduledId = toId<"pageScheduled">(deps.scheduledId);
      const scheduled = await context.queryClient.ensureQueryData(
        shopQueries.getScheduledPreview(scheduledId),
      );
      if (!scheduled) throw notFound();
      await prefetchBlockData(context.queryClient, scheduled.blocks);
      return { mode: "scheduled" as const, scheduledId };
    }

    if (deps.releaseId) {
      const releaseId = toId<"pageReleases">(deps.releaseId);
      const release = await context.queryClient.ensureQueryData(
        shopQueries.getReleasePreview(releaseId),
      );
      if (!release) throw notFound();
      await prefetchBlockData(context.queryClient, release.blocks);
      return { mode: "release" as const, releaseId };
    }

    // Intentionally fetchQuery, not ensureQueryData: the customer facing page
    // should not update live. The calls above are for internal previews and subscribe
    // to live updates, but this one is a 1 time fetch for customer facing published pages
    const path = `/${params._splat}`;
    const page = await context.queryClient.fetchQuery(
      shopQueries.getByPath(path),
    );

    if (!page) {
      throw notFound();
    }

    await prefetchBlockData(context.queryClient, page.blocks);
    return { mode: "page" as const, page };
  },
  head: ({ loaderData }) => {
    if (loaderData?.mode !== "page") return {};
    return buildSeoHead({
      title: loaderData.page.title,
      description: defaultSeoDescription,
      canonicalUrl: `${env.VITE_SITE_URL}${loaderData.page.path}`,
      imageUrl: FALLBACK_IMAGE,
      imageAlt: "Lifestyle photos from our collection of apparel",
    });
  },
});

function RouteComponent() {
  const view = Route.useLoaderData({
    select: (data) => {
      switch (data.mode) {
        case "draft":
          return { mode: "draft" as const, draftId: data.draftId };
        case "scheduled":
          return { mode: "scheduled" as const, scheduledId: data.scheduledId };
        case "release":
          return { mode: "release" as const, releaseId: data.releaseId };
        case "page":
          return { mode: "page" as const, blocks: data.page.blocks };
      }
    },
  });

  switch (view.mode) {
    case "draft":
      return <DraftPreview id={view.draftId} />;
    case "scheduled":
      return <ScheduledPreview id={view.scheduledId} />;
    case "release":
      return <ReleasePreview id={view.releaseId} />;
    case "page":
      return (
        <PageWrapper>
          <BlockRenderer blocks={view.blocks} />
        </PageWrapper>
      );
  }
}
