/**
 * Known product color names mapped to their hex values.
 * Used to render visual color swatches on the PDP instead of plain text buttons.
 */
const KNOWN_COLORS = {
  White: "#F9F9F9",
  "Athletic Heather": "#CCCED5",
  Black: "#0D0D0D",
  Red: "#E80000",
  Clay: "#7A4433",
  Ecru: "#E7DED0",
  Butter: "#F7F2DE",
  Eucalyptus: "#9D9D8B",
  Pistachio: "#BCBF9E",
  Cypress: "#646D5C",
  "Pine Green": "#081B18",
  "Midnight Blue": "#393C51",
  Navy: "#04142A",
  Plum: "#2F202A",
  Orchid: "#E3DDE3",
  "Heather Grey": "#CDD1D6",
  Sandshell: "#E8E2D0",
} as const satisfies Record<string, string>;

/**
 * Look up a hex color for a given color name.
 * Returns the hex string if found, or undefined for unknown colors.
 */
export function getKnownColorHex(colorName: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- runtime lookup against a const map requires widening the key type
  return (KNOWN_COLORS as Record<string, string>)[colorName];
}

/**
 * Returns true if a hex color is perceptually light (would blend into a white background).
 * Uses relative luminance with a threshold tuned for swatch visibility.
 */
export function isLightColor(hex: string) {
  const luminance = getRelativeLuminance(hex);
  return luminance > 0.7;
}

/**
 * Returns true if a hex color is perceptually dark (would blend into a dark background).
 * Uses relative luminance with a threshold tuned for swatch visibility.
 */
export function isDarkColor(hex: string) {
  const luminance = getRelativeLuminance(hex);
  return luminance < 0.08;
}

function getRelativeLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // sRGB to linear
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
