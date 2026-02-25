import { useNavigate, useSearch } from "@tanstack/react-router";

import { useIsMobile } from "~/hooks/use-is-mobile";

export function useProductRouteVariant() {
  const variantId = useSearch({
    from: "/shop/$item",
    select: (search) => search.variant,
  });
  const navigate = useNavigate({ from: "/shop/$item" });
  const isMobile = useIsMobile();

  function onVariantIdChange(nextVariantId: string) {
    void navigate({
      to: ".",
      search: (previousSearch) => ({
        ...previousSearch,
        variant: nextVariantId,
      }),
      resetScroll: isMobile === false,
    });
  }

  return {
    variantId,
    onVariantIdChange,
  };
}
