export const imageWidths = [
  32, 40, 48, 64, 80, 96, 120, 132, 144, 160, 192, 240, 320, 400, 480, 560, 640,
  750, 828, 960, 1080, 1200, 1280, 1440, 1600, 1920, 2048, 2560,
] as const;

export type ImgWidth = (typeof imageWidths)[number];
export const largestImageWidth: ImgWidth =
  imageWidths[imageWidths.length - 1] ?? imageWidths[0];
