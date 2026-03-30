import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";
import { Card, CardContent } from "@acme/ui/card";

import { formatDate, formatFileSize } from "~/features/files/lib/format";

export function FilesList() {
  const { data: files } = useSuspenseQuery({
    ...convexQuery(api.files.list, {}),
    select: (data) =>
      data.map((file) => ({
        _id: file._id,
        fileName: file.fileName,
        contentType: file.contentType,
        size: file.size,
        uploadedBy: file.uploadedBy,
        _creationTime: file._creationTime,
      })),
  });

  if (files.length === 0) {
    return (
      <section className="space-y-4">
        <FilesListHeading />
        <Card size="sm">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm">
              No files have been uploaded yet.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <FilesListHeading />
      <div className="space-y-3">
        {files.map((file) => (
          <Card key={file._id} size="sm">
            <CardContent className="flex flex-col gap-3 py-1 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">{file.fileName}</p>
                <p className="text-muted-foreground text-sm">
                  {file.contentType ?? "Unknown type"} ·{" "}
                  {formatFileSize(file.size)}
                </p>
              </div>
              <div className="text-muted-foreground space-y-1 text-sm sm:text-right">
                <p>
                  Uploaded by{" "}
                  {file.uploadedBy?.name ??
                    file.uploadedBy?.email ??
                    "Unknown user"}
                </p>
                <p>{formatDate(file._creationTime)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FilesListHeading() {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">Recent uploads</h2>
      <p className="text-muted-foreground text-sm">
        Newest shared CMS assets appear first.
      </p>
    </div>
  );
}
