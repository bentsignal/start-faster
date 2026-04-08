import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";
import type { Block } from "@acme/convex/page-validators";

import { usePageMutations } from "./use-page-mutations";

const DEBOUNCE_MS = 800;

export function useAutosave({
  draftId,
  blocks,
}: {
  draftId: Id<"pageDrafts">;
  blocks: Block[];
}) {
  const pageMutations = usePageMutations();

  const serialized = JSON.stringify(blocks);

  // Reactive state for render-time comparison (updated on successful save)
  const [lastSavedSerialized, setLastSavedSerialized] = useState(serialized);

  const { mutate, mutateAsync, isPending } = useMutation({
    ...pageMutations.saveDraft,
    onSuccess: (_data, variables) => {
      setLastSavedSerialized(JSON.stringify(variables.blocks));
    },
  });

  const blocksRef = useRef(blocks);
  const serializedRef = useRef(serialized);
  const draftIdRef = useRef(draftId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirror for imperative dedup in callbacks (avoids double-saves)
  const lastSavedSerializedRef = useRef(serialized);

  // Sync refs in an effect to avoid writing during render
  // eslint-disable-next-line no-restricted-syntax -- syncs prop to ref for imperative access without retriggering the debounce timer
  useEffect(() => {
    blocksRef.current = blocks;
    serializedRef.current = serialized;
  }, [blocks, serialized]);

  // eslint-disable-next-line no-restricted-syntax -- syncs prop to ref for imperative access without retriggering the debounce timer
  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  /** Flush pending changes and wait for the save to complete. */
  const flushAndAwait = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (serializedRef.current !== lastSavedSerializedRef.current) {
      lastSavedSerializedRef.current = serializedRef.current;
      await mutateAsync({
        draftId: draftIdRef.current,
        blocks: blocksRef.current,
      });
    }
  };

  // eslint-disable-next-line no-restricted-syntax -- debounced save timer that syncs blocks to the backend
  useEffect(() => {
    if (serialized === lastSavedSerializedRef.current) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      lastSavedSerializedRef.current = serializedRef.current;
      mutate({ draftId: draftIdRef.current, blocks: blocksRef.current });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [serialized, mutate]);

  // eslint-disable-next-line no-restricted-syntax -- flushes pending changes on unmount to prevent data loss
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (serializedRef.current !== lastSavedSerializedRef.current) {
        lastSavedSerializedRef.current = serializedRef.current;
        mutate({ draftId: draftIdRef.current, blocks: blocksRef.current });
      }
    };
  }, [mutate]);

  // Only show the browser's "unsaved changes" dialog when there are actually
  // unsaved changes: either blocks diverged from last save or a mutation is
  // currently in flight.
  const hasUnsavedChanges = serialized !== lastSavedSerialized || isPending;

  // Block navigation until any pending save completes
  useBlocker({
    shouldBlockFn: async () => {
      await flushAndAwait();
      return false;
    },
    enableBeforeUnload: hasUnsavedChanges,
  });
}
