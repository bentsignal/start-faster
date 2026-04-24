import type { Id } from "@acme/convex/model";

export interface FileRow {
  _id: Id<"files">;
  fileName: string;
  contentType: string | null;
  size: number;
  _creationTime: number;
  downloadToken?: string;
  uploadedBy: { name: string; email: string } | null;
}
