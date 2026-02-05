import type { PFPVariant } from "./types";

function getPFPSizeNumber(variant: PFPVariant) {
  switch (variant) {
    case "sm":
      return 40;
    case "md":
      return 64;
    case "lg":
      return 96;
  }
}

function getPFPClassName(variant: PFPVariant) {
  switch (variant) {
    case "sm":
      return "size-10";
    case "md":
      return "size-16";
    case "lg":
      return "size-24";
  }
}

function normalizeProfileLink(link: string) {
  let url: URL;

  try {
    url = new URL(link);
  } catch {
    url = new URL(`https://${link}`);
  }

  const hostname = url.hostname;
  const parts = hostname.split(".");

  let displayHostname = hostname;

  if (parts.length >= 3 && parts[0] === "www") {
    displayHostname = parts.slice(1).join(".");
  }

  return {
    href: url.toString(),
    display: displayHostname,
  };
}

export { getPFPSizeNumber, getPFPClassName, normalizeProfileLink };
