import { useNavigate, useSearch } from "@tanstack/react-router";

import { useIsMobile } from "~/hooks/use-is-mobile";

export function useProductRouteVariant() {
  const variantId = useSearch({
    from: "/shop/$item",
    select: (search) => search.variant,
  });
  const navigate = useNavigate({ from: "/shop/$item" });
  const isMobile = useIsMobile();
  const initialVariantImageFocusMode = "reorder" as const;

  function onVariantIdChange(nextVariantId: string) {
    void navigate({
      to: ".",
      search: (previousSearch) => ({
        ...previousSearch,
        variant: nextVariantId,
      }),
      replace: true,
      resetScroll: isMobile === false,
    });
  }

  return {
    variantId,
    initialVariantImageFocusMode,
    onVariantIdChange,
  };
}
