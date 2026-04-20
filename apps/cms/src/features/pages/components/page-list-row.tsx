import { Circle, ExternalLink } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { QuickLink } from "@acme/features/quick-link";

import { env } from "~/env";

interface PageRow {
  _id: Id<"pages">;
  title: string;
  path: string;
  hasRelease: boolean;
  hasDraft: boolean;
}

export function PageListRow({
  page,
  className,
}: {
  page: PageRow;
  className?: string;
}) {
  return (
    <QuickLink
      to="/pages/$pageId"
      params={{ pageId: page._id }}
      className={
        "border-border/60 bg-background hover:bg-muted/50 flex items-center gap-4 rounded-lg border px-3 py-2.5 transition-colors " +
        (className ?? "")
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{page.title}</span>
        <span className="text-muted-foreground truncate text-xs">
          {page.path}
        </span>
      </div>
      <PageStatus
        hasRelease={page.hasRelease}
        hasDraft={page.hasDraft}
        path={page.path}
      />
    </QuickLink>
  );
}

function PageStatus({
  hasRelease,
  hasDraft,
  path,
}: {
  hasRelease: boolean;
  hasDraft: boolean;
  path: string;
}) {
  if (!hasRelease) {
    return (
      <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <Circle className="text-muted-foreground size-1.5 fill-current" />
        Draft
      </span>
    );
  }

  return (
    <>
      <span className="bg-chart-2/15 text-chart-2 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <Circle className="text-chart-2 size-1.5 fill-current" />
        Published
        {hasDraft ? (
          <span className="text-muted-foreground text-[10px]">+ draft</span>
        ) : null}
      </span>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground -m-2 p-2 transition-colors hover:cursor-pointer"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(
            `${env.VITE_SHOP_URL}${path}`,
            "_blank",
            "noopener,noreferrer",
          );
        }}
      >
        <ExternalLink className="size-3.5" />
      </button>
    </>
  );
}
