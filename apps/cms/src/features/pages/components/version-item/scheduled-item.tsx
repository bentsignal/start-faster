import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";
import { QuickLink } from "@acme/features/quick-link";

import { ScheduleDraftModal } from "~/features/pages/components/schedule-draft-modal";
import { ScheduledActionsMenu } from "./scheduled-actions-menu";
import { VersionItemShell } from "./version-item";

export interface ScheduledRow {
  _id: Id<"pageScheduled">;
  name: string;
  scheduledAt: number;
}

function useScheduledItem() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  return {
    pageId,
    isMenuOpen,
    setMenuOpen,
    rescheduleOpen,
    setRescheduleOpen,
  };
}

export function ScheduledItem({ scheduled }: { scheduled: ScheduledRow }) {
  const { pageId, isMenuOpen, setMenuOpen, rescheduleOpen, setRescheduleOpen } =
    useScheduledItem();

  return (
    <>
      <VersionItemShell
        badge="scheduled"
        name={scheduled.name}
        time={{ kind: "future", timestamp: scheduled.scheduledAt }}
        isMenuOpen={isMenuOpen}
        link={
          <QuickLink
            to="/pages/$pageId/scheduled/$scheduledId"
            params={{ pageId, scheduledId: scheduled._id }}
            search={(prev) => prev}
            activeProps={{ "data-active": "" }}
          />
        }
        actionsMenu={
          <ScheduledActionsMenu
            scheduledId={scheduled._id}
            isOpen={isMenuOpen}
            setOpen={setMenuOpen}
            onOpenReschedule={() => setRescheduleOpen(true)}
          />
        }
      />
      <ScheduleDraftModal
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        mode={{
          kind: "reschedule",
          scheduledId: scheduled._id,
          initialAt: scheduled.scheduledAt,
        }}
      />
    </>
  );
}
