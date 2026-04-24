import {
  FileArchive,
  FileAudio,
  FileCode,
  File as FileIcon,
  FileText,
  FileVideo,
  Image as ImageIcon,
} from "lucide-react";

function prefixIcon(contentType: string, className?: string) {
  if (contentType.startsWith("image/"))
    return <ImageIcon className={className} />;
  if (contentType.startsWith("audio/"))
    return <FileAudio className={className} />;
  if (contentType.startsWith("video/"))
    return <FileVideo className={className} />;
  if (contentType.startsWith("text/"))
    return <FileText className={className} />;
  return null;
}

function substringIcon(contentType: string, className?: string) {
  if (/zip|tar|compressed/.test(contentType))
    return <FileArchive className={className} />;
  if (/json|javascript/.test(contentType))
    return <FileCode className={className} />;
  return null;
}

export function FileTypeIcon({
  contentType,
  className,
}: {
  contentType: string | null;
  className?: string;
}) {
  if (!contentType) return <FileIcon className={className} />;

  return (
    prefixIcon(contentType, className) ??
    substringIcon(contentType, className) ?? <FileIcon className={className} />
  );
}
