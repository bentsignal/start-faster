import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

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
  const { mutate } = useMutation(pageMutations.saveDraft);

  const contentRef = useRef(content);
  const draftIdRef = useRef(draftId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
}
