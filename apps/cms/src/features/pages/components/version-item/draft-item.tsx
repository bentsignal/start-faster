import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";
import { QuickLink } from "@acme/features/quick-link";

import { ScheduleDraftModal } from "~/features/pages/components/schedule-draft-modal";
import { useNavigateToPageHubTab } from "~/features/pages/hooks/use-navigate-to-page-hub-tab";
import { DraftActionsMenu } from "./draft-actions-menu";
import { VersionItemShell } from "./version-item";

export interface DraftRow {
  _id: Id<"pageDrafts">;
  name: string;
  updatedAt: number;
  lastScheduledAt?: number;
}

function useDraftItem() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const navigateToTab = useNavigateToPageHubTab();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return {
    pageId,
    navigateToTab,
    isMenuOpen,
    setMenuOpen,
    scheduleOpen,
    setScheduleOpen,
  };
}

export function DraftItem({ draft }: { draft: DraftRow }) {
  const {
    pageId,
    navigateToTab,
    isMenuOpen,
    setMenuOpen,
    scheduleOpen,
    setScheduleOpen,
  } = useDraftItem();

  return (
    <>
      <VersionItemShell
        badge="draft"
        name={draft.name}
        time={{ kind: "past", timestamp: draft.updatedAt }}
        isMenuOpen={isMenuOpen}
        link={
          <QuickLink
            to="/pages/$pageId/draft/$draftId"
            params={{ pageId, draftId: draft._id }}
            search={(prev) => prev}
            activeProps={{ "data-active": "" }}
          />
        }
        actionsMenu={
          <DraftActionsMenu
            draftId={draft._id}
            isOpen={isMenuOpen}
            setOpen={setMenuOpen}
            onOpenSchedule={() => setScheduleOpen(true)}
          />
        }
      />
      <ScheduleDraftModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        mode={{
          kind: "schedule",
          draftId: draft._id,
          initialAt: draft.lastScheduledAt,
        }}
        onSuccess={() => {
          void navigateToTab("scheduled");
        }}
      />
    </>
  );
}
