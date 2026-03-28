import { useCallback, useEffect, useRef, useState } from "react";
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
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (contentRef.current !== lastSavedContentRef.current) {
      lastSavedContentRef.current = contentRef.current;
      mutate({ draftId: draftIdRef.current, content: contentRef.current });
    }
  }, [mutate]);

  /** Flush pending changes and wait for the save to complete. */
  const flushAndAwait = useCallback(async () => {
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
  }, [mutateAsync]);

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

  // Flush on unmount
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

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
