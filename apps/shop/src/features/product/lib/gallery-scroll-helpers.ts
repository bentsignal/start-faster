const SCROLL_INTERRUPT_KEY_LIST = [
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
] as const;

export const SCROLL_INTERRUPT_KEYS = new Set<string>(SCROLL_INTERRUPT_KEY_LIST);

export function getHeaderHeight() {
  const headerElement =
    document.querySelector<HTMLElement>("[data-site-header]");

  return headerElement?.getBoundingClientRect().height ?? 0;
}

export function getViewportAnchorY() {
  return getHeaderHeight() + 24;
}

export function getVisibleSections(
  imageSectionsRef: React.RefObject<(HTMLElement | null)[]>,
) {
  return imageSectionsRef.current.filter(
    (section): section is HTMLElement => section !== null,
  );
}

export function findClosestSectionIndex(
  sections: HTMLElement[],
  anchorY: number,
  currentIndex: number,
) {
  let closestSectionIndex = currentIndex;
  let closestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const index = Number(section.getAttribute("data-image-index"));

    if (Number.isNaN(index)) {
      return;
    }

    const rect = section.getBoundingClientRect();

    if (rect.bottom <= anchorY || rect.top >= window.innerHeight) {
      return;
    }

    const distance = Math.abs(rect.top - anchorY);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestSectionIndex = index;
    }
  });

  return { closestSectionIndex, closestDistance };
}

export interface ProgrammaticScrollRefs {
  pendingTargetIndex: React.RefObject<number | null>;
  pendingTargetScrollY: React.RefObject<number | null>;
  wasInterrupted: React.RefObject<boolean>;
  imageSections: React.RefObject<(HTMLElement | null)[]>;
}

export function resolvePendingProgrammaticScroll(
  refs: ProgrammaticScrollRefs,
  anchorY: number,
) {
  const pendingTargetIndex = refs.pendingTargetIndex.current;

  if (pendingTargetIndex === null) {
    return "resolved";
  }

  if (refs.wasInterrupted.current) {
    refs.pendingTargetIndex.current = null;
    refs.pendingTargetScrollY.current = null;
    refs.wasInterrupted.current = false;
    return "resolved";
  }

  const targetSection = refs.imageSections.current[pendingTargetIndex];

  if (!targetSection) {
    refs.pendingTargetIndex.current = null;
    refs.pendingTargetScrollY.current = null;
    return "resolved";
  }

  const targetDistance = Math.abs(
    targetSection.getBoundingClientRect().top - anchorY,
  );
  const targetScrollY = refs.pendingTargetScrollY.current;
  const isNearTargetScrollY =
    targetScrollY !== null && Math.abs(window.scrollY - targetScrollY) <= 6;

  if (targetDistance <= 6 || isNearTargetScrollY) {
    refs.pendingTargetIndex.current = null;
    refs.pendingTargetScrollY.current = null;
    return "resolved";
  }

  return "pending";
}

export function setupScrollInterruptListeners(
  pendingProgrammaticTargetIndexRef: React.RefObject<number | null>,
  wasProgrammaticScrollInterruptedRef: React.MutableRefObject<boolean>,
) {
  function interruptProgrammaticScroll() {
    if (pendingProgrammaticTargetIndexRef.current === null) {
      return;
    }

    wasProgrammaticScrollInterruptedRef.current = true;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (SCROLL_INTERRUPT_KEYS.has(event.key)) {
      interruptProgrammaticScroll();
    }
  }

  window.addEventListener("wheel", interruptProgrammaticScroll, {
    passive: true,
  });
  window.addEventListener("touchstart", interruptProgrammaticScroll, {
    passive: true,
  });
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("pointerdown", interruptProgrammaticScroll, {
    passive: true,
  });

  return () => {
    window.removeEventListener("wheel", interruptProgrammaticScroll);
    window.removeEventListener("touchstart", interruptProgrammaticScroll);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("pointerdown", interruptProgrammaticScroll);
  };
}

export function createIntersectionHandler(
  scrollRefs: ProgrammaticScrollRefs,
  activeImageIndexRef: React.RefObject<number>,
  setActiveImageIndex: (index: number) => void,
) {
  return () => {
    const sections = getVisibleSections(scrollRefs.imageSections);

    if (sections.length === 0) {
      return;
    }

    const anchorY = getViewportAnchorY();
    const { closestSectionIndex, closestDistance } = findClosestSectionIndex(
      sections,
      anchorY,
      activeImageIndexRef.current,
    );

    if (closestDistance === Number.POSITIVE_INFINITY) {
      return;
    }

    const scrollStatus = resolvePendingProgrammaticScroll(scrollRefs, anchorY);
    if (scrollStatus === "pending") {
      return;
    }

    if (closestSectionIndex !== activeImageIndexRef.current) {
      activeImageIndexRef.current = closestSectionIndex;
      setActiveImageIndex(closestSectionIndex);
    }
  };
}
