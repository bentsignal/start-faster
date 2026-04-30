import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { formatAbsoluteDateTime } from "~/features/pages/lib/format-relative-time";
import { pageQueries } from "~/features/pages/lib/page-queries";

export function PageInformation() {
  const { createdBy, createdAt, path } = usePageInformation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Page Information
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Details about this page.
        </p>
      </div>
      <dl className="divide-border divide-y">
        <InfoRow label="URL Path" value={path} mono />
        <InfoRow label="Created by" value={createdBy} />
        <InfoRow label="Created" value={createdAt} />
      </dl>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-muted-foreground shrink-0 text-sm">{label}</dt>
      <dd
        className={`truncate text-right text-sm ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function usePageInformation() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (d) => ({
      path: d.path,
      createdBy: d.createdBy?.name ?? "Unknown",
      createdAt: formatAbsoluteDateTime(d._creationTime),
    }),
  });

  return data;
}
