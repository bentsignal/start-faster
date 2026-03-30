import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";

import { usePageMutations } from "./use-page-mutations";

const DEBOUNCE_MS = 800;

export function useAutosave({
  draftId,
  content,
}: {
  draftId: Id<"pageDrafts">;
  content: string;
}) {
  const pageMutations = usePageMutations();

  // Reactive state for render-time comparison (updated on successful save)
  const [lastSavedContent, setLastSavedContent] = useState(content);

  const { mutate, mutateAsync, isPending } = useMutation({
    ...pageMutations.saveDraft,
    onSuccess: (_data, variables) => {
      setLastSavedContent(variables.content);
    },
  });

  const contentRef = useRef(content);
  const draftIdRef = useRef(draftId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirror for imperative dedup in callbacks (avoids double-saves)
  const lastSavedContentRef = useRef(content);

  // Sync refs in an effect to avoid writing during render
  // eslint-disable-next-line no-restricted-syntax -- syncs prop to ref for imperative access without retriggering the debounce timer
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

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
    if (contentRef.current !== lastSavedContentRef.current) {
      lastSavedContentRef.current = contentRef.current;
      await mutateAsync({
        draftId: draftIdRef.current,
        content: contentRef.current,
      });
    }
  };

  // eslint-disable-next-line no-restricted-syntax -- debounced save timer that syncs content to the backend
  useEffect(() => {
    if (content === lastSavedContentRef.current) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      lastSavedContentRef.current = contentRef.current;
      mutate({ draftId: draftIdRef.current, content: contentRef.current });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [content, mutate]);

  // eslint-disable-next-line no-restricted-syntax -- flushes pending changes on unmount to prevent data loss
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (contentRef.current !== lastSavedContentRef.current) {
        lastSavedContentRef.current = contentRef.current;
        mutate({ draftId: draftIdRef.current, content: contentRef.current });
      }
    };
  }, [mutate]);

  // Only show the browser's "unsaved changes" dialog when there are actually
  // unsaved changes: either content diverged from last save or a mutation is
  // currently in flight.
  const hasUnsavedChanges = content !== lastSavedContent || isPending;

  // Block navigation until any pending save completes
  useBlocker({
    shouldBlockFn: async () => {
      await flushAndAwait();
      return false;
    },
    enableBeforeUnload: hasUnsavedChanges,
  });
}
