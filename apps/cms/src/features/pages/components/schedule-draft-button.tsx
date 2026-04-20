import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";

import { Button } from "@acme/ui/button";

import { ScheduleDraftModal } from "~/features/pages/components/schedule-draft-modal";
import { useNavigateToPageHubTab } from "~/features/pages/hooks/use-navigate-to-page-hub-tab";
import { pageQueries } from "~/features/pages/lib/page-queries";

export function ScheduleDraftButton() {
  const { open, setOpen, draftId, lastScheduledAt, onScheduled } =
    useDraftScheduleContext();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <CalendarClock className="size-3.5" />
        Schedule
      </Button>
      <ScheduleDraftModal
        open={open}
        onOpenChange={setOpen}
        mode={{ kind: "schedule", draftId, initialAt: lastScheduledAt }}
        onSuccess={onScheduled}
      />
    </>
  );
}

function useDraftScheduleContext() {
  const [open, setOpen] = useState(false);
  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
    select: (ctx) => ctx.draftId,
  });
  const { data: lastScheduledAt } = useSuspenseQuery({
    ...pageQueries.getDraft(draftId),
    select: (data) => data.lastScheduledAt,
  });
  const navigateToTab = useNavigateToPageHubTab();

  const onScheduled = () => {
    void navigateToTab("scheduled");
  };

  return { open, setOpen, draftId, lastScheduledAt, onScheduled };
}
