export const imageDeviceSizes = [
  640, 750, 828, 1080, 1200, 1600, 1920, 2560,
] as const;

export const imageSizes = [32, 48, 64, 96, 128, 256, 384] as const;

export const imageWidths = [...imageSizes, ...imageDeviceSizes] as const;

export type ImgWidth = (typeof imageWidths)[number];
export const largestImageWidth: ImgWidth =
  imageWidths[imageWidths.length - 1] ?? imageWidths[0];
