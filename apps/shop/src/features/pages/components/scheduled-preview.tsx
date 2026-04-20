import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";

import { BlockRenderer } from "~/features/pages/components/block-renderer";
import { PageWrapper } from "~/features/pages/components/page-wrapper";
import { shopQueries } from "~/lib/queries";

export function ScheduledPreview({ id }: { id: Id<"pageScheduled"> }) {
  const { data } = useSuspenseQuery({
    ...shopQueries.getScheduledPreview(id),
    select: (d) => (d ? { blocks: d.blocks } : null),
  });
  if (!data) throw notFound();
  return (
    <PageWrapper>
      <BlockRenderer blocks={data.blocks} />
    </PageWrapper>
  );
}
