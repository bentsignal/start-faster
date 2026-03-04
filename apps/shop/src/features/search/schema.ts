import { z } from "zod";

const priceFilterSchema = z
  .object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  })
  .strict()
  .refine((value) => value.min !== undefined || value.max !== undefined);

const variantOptionFilterSchema = z
  .object({
    name: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

export const supportedFilterSchema = z.union([
  z
    .object({
      available: z.boolean(),
    })
    .strict(),
  z
    .object({
      price: priceFilterSchema,
    })
    .strict(),
  z
    .object({
      productType: z.string().min(1),
    })
    .strict(),
  z
    .object({
      productVendor: z.string().min(1),
    })
    .strict(),
  z
    .object({
      tag: z.string().min(1),
    })
    .strict(),
  z
    .object({
      variantOption: variantOptionFilterSchema,
    })
    .strict(),
]);
