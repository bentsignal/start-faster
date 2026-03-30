import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, X } from "lucide-react";

import { Input } from "@acme/ui/input";

const SEARCH_DEBOUNCE_MS = 500;

export function UserSearchInput() {
  const { searchTerm, setSearchTerm } = useUserSearch();

  return (
    <div className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
      <Input
        id="user-search"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value);
        }}
        className="h-11 rounded-full pl-11 text-sm tracking-normal"
      />
      {searchTerm.length > 0 && (
        <button
          type="button"
          className="absolute top-1/2 right-4 size-5 -translate-y-1/2 cursor-pointer"
          onClick={() => setSearchTerm("")}
        >
          <X className="text-muted-foreground size-5" />
        </button>
      )}
    </div>
  );
}

function useUserSearch() {
  const initialSearchTerm = useSearch({
    from: "/_authenticated/_authorized/dashboard",
    select: (search) => search.q ?? "",
  });
  const navigate = useNavigate({ from: "/dashboard" });
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // eslint-disable-next-line no-restricted-syntax -- syncs debounced input to router search params (external URL state)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextQuery = searchTerm.trim();
      const currentQuery = initialSearchTerm;
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
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [initialSearchTerm, navigate, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
  };
}
