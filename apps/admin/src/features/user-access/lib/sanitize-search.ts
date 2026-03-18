export function sanitizeSearch(search?: string) {
  const trimmedSearch = search?.trim();
  if (trimmedSearch === undefined || trimmedSearch.length === 0) {
    return undefined;
  }
  return trimmedSearch;
}
