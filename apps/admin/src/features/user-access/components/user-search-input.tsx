import { Search, X } from "lucide-react";

import { Input } from "@acme/ui/input";

import { useUserSearch } from "~/features/user-access/hooks/use-user-search";

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
