import type { MutationKey } from "@tanstack/react-query";
import { useMutationState } from "@tanstack/react-query";

export function useIsPending(mutationKey: MutationKey) {
  return useMutationState({
    filters: { mutationKey, status: "pending" },
    select: (mutation) => mutation.state.status === "pending",
  }).some(Boolean);
}
