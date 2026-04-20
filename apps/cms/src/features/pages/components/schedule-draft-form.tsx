import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import { DialogClose, DialogFooter } from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toaster";

import type { ScheduleMode } from "~/features/pages/lib/schedule-mode";
import { DateTimeLocalPicker } from "~/features/pages/components/datetime-local-picker";
import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import {
  toLocalInputValue,
  validateDateTime,
} from "~/features/pages/lib/datetime-local";
import { resolveInitialAt } from "~/features/pages/lib/schedule-mode";
import { useIsPending } from "~/hooks/use-is-pending";

export function ScheduleDraftForm({
  mode,
  onClose,
  onSuccess,
}: {
  mode: ScheduleMode;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { value, setValue, error, isPending, submit } = useScheduleDraftForm({
    mode,
    onSuccess,
    onClose,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="schedule-draft-datetime" className="text-sm font-medium">
        Publish at
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="schedule-draft-datetime"
          type="datetime-local"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={error ? true : undefined}
          className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
        <DateTimeLocalPicker value={value} onChange={setValue} />
      </div>
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Times are in your local timezone.
        </p>
      )}
      <DialogFooter className="mt-4">
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader className="size-3.5 animate-spin" /> : null}
          {mode.kind === "schedule" ? "Schedule" : "Reschedule"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function toastMutationError(err: unknown, fallback: string) {
  toast.error(err instanceof Error ? err.message : fallback);
}

function useScheduleMutations() {
  const pageMutations = usePageMutations();
  const isScheduling = useIsPending(pageMutations.scheduleDraft.mutationKey);
  const isRescheduling = useIsPending(
    pageMutations.rescheduleDraft.mutationKey,
  );

  const { mutateAsync: scheduleMutation } = useMutation({
    ...pageMutations.scheduleDraft,
    onError: (err) => toastMutationError(err, "Failed to schedule"),
  });
  const { mutateAsync: rescheduleMutation } = useMutation({
    ...pageMutations.rescheduleDraft,
    onError: (err) => toastMutationError(err, "Failed to reschedule"),
  });

  return {
    scheduleMutation,
    rescheduleMutation,
    isPending: isScheduling || isRescheduling,
  };
}

function useScheduleFormValue(mode: ScheduleMode) {
  const [value, setValue] = useState(() =>
    toLocalInputValue(resolveInitialAt(mode)),
  );
  const [error, setError] = useState<string | null>(null);
  return { value, setValue, error, setError };
}

function useScheduleDraftForm({
  mode,
  onSuccess,
  onClose,
}: {
  mode: ScheduleMode;
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const { value, setValue, error, setError } = useScheduleFormValue(mode);
  const { scheduleMutation, rescheduleMutation, isPending } =
    useScheduleMutations();

  async function submit() {
    const result = validateDateTime(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    if (mode.kind === "schedule") {
      await scheduleMutation({
        draftId: mode.draftId,
        scheduledAt: result.ts,
      });
    } else {
      await rescheduleMutation({
        scheduledId: mode.scheduledId,
        scheduledAt: result.ts,
      });
    }
    onClose();
    onSuccess?.();
  }

  return { value, setValue, error, isPending, submit };
}
