import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import type { ScheduleMode } from "~/features/pages/lib/schedule-mode";
import { ScheduleDraftForm } from "~/features/pages/components/schedule-draft-form";

export function ScheduleDraftModal({
  open,
  onOpenChange,
  mode,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ScheduleMode;
  onSuccess?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode.kind === "schedule"
              ? "Schedule this draft"
              : "Reschedule this version"}
          </DialogTitle>
          <DialogDescription>
            {mode.kind === "schedule"
              ? "The draft will be published automatically at the time you choose. Your draft will be locked once scheduled."
              : "Pick a new time for this version to go live."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ScheduleDraftForm
            mode={mode}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
