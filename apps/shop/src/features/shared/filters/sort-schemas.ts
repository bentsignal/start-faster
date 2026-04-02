import { z } from "zod";

export const sortBySchema = z.enum(["relevance", "price"]).default("relevance");
export type SortBy = z.infer<typeof sortBySchema>;

export const sortDirectionSchema = z.enum(["asc", "desc"]).default("desc");
export type SortDirection = z.infer<typeof sortDirectionSchema>;
