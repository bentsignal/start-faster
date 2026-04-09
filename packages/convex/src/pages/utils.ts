const RESERVED_PATHS = [
  "/",
  "/shop",
  "/collections",
  "/search",
  "/_auth",
  "/_authenticated",
  "/account",
  "/settings",
  "/orders",
] as const;

export function validatePath(path: string) {
  const trimmed = path.trim();

  if (!trimmed.startsWith("/")) {
    return { status: "invalid" as const, error: "Path must start with /" };
  }

  if (trimmed !== "/" && trimmed.endsWith("/")) {
    return { status: "invalid" as const, error: "Path must not end with /" };
  }

  for (const reserved of RESERVED_PATHS) {
    if (trimmed === reserved || trimmed.startsWith(reserved + "/")) {
      return {
        status: "invalid" as const,
        error: `Path ${reserved} is reserved`,
      };
    }
  }

  return { status: "valid" as const, path: trimmed };
}
