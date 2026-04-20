import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";
import { QuickLink } from "@acme/features/quick-link";

import { ReleaseActionsMenu } from "./release-actions-menu";
import { VersionItemShell } from "./version-item";

export interface ReleaseRow {
  _id: Id<"pageReleases">;
  _creationTime: number;
  name: string;
}

function useReleaseItem() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const [isMenuOpen, setMenuOpen] = useState(false);
  return { pageId, isMenuOpen, setMenuOpen };
}

export function ReleaseItem({
  release,
  isLatest,
}: {
  release: ReleaseRow;
  isLatest: boolean;
}) {
  const { pageId, isMenuOpen, setMenuOpen } = useReleaseItem();

  return (
    <VersionItemShell
      badge={isLatest ? "live" : "previous"}
      name={release.name}
      time={{ kind: "past", timestamp: release._creationTime }}
      isMenuOpen={isMenuOpen}
      link={
        <QuickLink
          to="/pages/$pageId/release/$releaseId"
          params={{ pageId, releaseId: release._id }}
          search={(prev) => prev}
          activeProps={{ "data-active": "" }}
        />
      }
      actionsMenu={
        <ReleaseActionsMenu
          releaseId={release._id}
          isOpen={isMenuOpen}
          setOpen={setMenuOpen}
        />
      }
    />
  );
}
