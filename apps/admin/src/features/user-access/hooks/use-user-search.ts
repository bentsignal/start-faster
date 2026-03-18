import { useEffect } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { useDebouncedInput } from "~/hooks/use-debounced-input";

const dashboardRouteApi = getRouteApi("/_authenticated/_authorized/dashboard");

export function useUserSearch() {
  const searchTermFromUrl = dashboardRouteApi.useSearch({
    select: (search) => search.q,
  });
  const navigate = useNavigate({ from: "/dashboard" });

  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue,
  } = useDebouncedInput({
    time: 500,
    initialValue: searchTermFromUrl ?? "",
  });

  useEffect(() => {
    const nextQuery = debouncedValue.trim();
    const currentQuery = searchTermFromUrl ?? "";
    if (nextQuery === currentQuery) {
      return;
    }

    void navigate({
      to: "/dashboard",
      replace: true,
      search: {
        q: nextQuery.length > 0 ? nextQuery : undefined,
      },
    });
  }, [debouncedValue, navigate, searchTermFromUrl]);

  return {
    searchTerm,
    setSearchTerm,
  };
}
