export const imageWidths = [32, 40] as const;
export const largestImageWidth = imageWidths[imageWidths.length - 1];

export type ImgWidth = (typeof imageWidths)[number];
