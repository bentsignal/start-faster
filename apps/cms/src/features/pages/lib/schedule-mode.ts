import type { Id } from "@acme/convex/model";

import { nextHourTimestamp } from "~/features/pages/lib/datetime-local";

export type ScheduleMode =
  | { kind: "schedule"; draftId: Id<"pageDrafts">; initialAt?: number }
  | {
      kind: "reschedule";
      scheduledId: Id<"pageScheduled">;
      initialAt: number;
    };

export function resolveInitialAt(mode: ScheduleMode) {
  switch (mode.kind) {
    case "reschedule":
      return mode.initialAt;
    case "schedule":
      if (mode.initialAt && mode.initialAt > Date.now()) return mode.initialAt;
      return nextHourTimestamp();
  }
}
