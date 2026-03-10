function normalizeOptionName(value: string) {
  return value.trim().toLowerCase();
}

export function isColorOptionName(value: string) {
  const normalized = normalizeOptionName(value);
  return normalized === "color" || normalized === "colour";
}

export function isSizeOptionName(value: string) {
  return normalizeOptionName(value) === "size";
}
