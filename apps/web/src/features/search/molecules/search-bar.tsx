import * as Search from "../atom";

function SearchBar() {
  return (
    <Search.Container>
      <Search.Icon />
      <Search.Input />
      <Search.ClearButton />
    </Search.Container>
  );
}

export { SearchBar };
