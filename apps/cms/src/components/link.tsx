import type { LinkComponent } from "@tanstack/react-router";
import type {
  ComponentPropsWithoutRef,
  MouseEvent,
  MouseEventHandler,
} from "react";
import { forwardRef, useRef } from "react";
import { createLink } from "@tanstack/react-router";

import { usePointerCapability } from "~/hooks/use-pointer-capability";

function canQuickNavigate(
  event: MouseEvent<HTMLAnchorElement>,
  href: string | undefined,
  target: string | undefined,
) {
  if (
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return false;
  }

  const elementTarget = event.currentTarget.getAttribute("target");
  const effectiveTarget = target ?? elementTarget;

  if (effectiveTarget && effectiveTarget !== "_self") {
    return false;
  }

  if (!href) {
    return false;
  }

  const url = new URL(href, window.location.href);
  return url.origin === window.location.origin;
}

const QuickAnchor = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<"a">
>(({ href, onClick, onMouseDown, target, ...props }, ref) => {
  const skipNextClickRef = useRef(false);

  const handleMouseDown: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onMouseDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (!canQuickNavigate(event, href, target)) {
      return;
    }

    skipNextClickRef.current = true;
    onClick?.(event);
  };

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (skipNextClickRef.current) {
      skipNextClickRef.current = false;
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  return (
    <a
      {...props}
      ref={ref}
      href={href}
      target={target}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    />
  );
});

QuickAnchor.displayName = "QuickAnchor";

const CreatedLink = createLink(QuickAnchor);

export const Link: LinkComponent<typeof QuickAnchor> = (props) => {
  const { isTouchPrimary, isKnown } = usePointerCapability();
  const preload =
    props.preload ?? (isKnown && isTouchPrimary ? "viewport" : "intent");

  return <CreatedLink preload={preload} {...props} />;
};
