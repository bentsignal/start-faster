import { Search, X } from "lucide-react";

import { Input } from "@acme/ui/input";

import { useUserSearch } from "~/features/user-access/hooks/use-user-search";

export function UserSearchInput() {
  const { searchTerm, setSearchTerm } = useUserSearch();

  return (
    <>
      <label htmlFor="user-search" className="text-sm font-medium">
        Search users
      </label>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id="user-search"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          className="pl-9"
        />
        {searchTerm.length > 0 && (
          <button
            type="button"
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 cursor-pointer"
            onClick={() => setSearchTerm("")}
          >
            <X className="text-muted-foreground size-4" />
          </button>
        )}
      </div>
    </>
  );
}
