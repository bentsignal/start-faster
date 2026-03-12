export const imageWidths = [
  32, 40, 64, 80, 96, 120, 320, 480, 640, 750, 828, 960, 1080, 1200, 1440,
] as const;

export type ImgWidth = (typeof imageWidths)[number];
export const largestImageWidth: ImgWidth =
  imageWidths[imageWidths.length - 1] ?? imageWidths[0];
