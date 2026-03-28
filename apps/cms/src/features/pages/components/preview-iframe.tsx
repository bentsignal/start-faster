import type { Viewport } from "./viewport-controls";
import { VIEWPORT_OPTIONS } from "./viewport-controls";

export function PreviewIframe({
  url,
  title = "Preview",
  viewport,
}: {
  url: string;
  title?: string;
  viewport: Viewport;
}) {
  const activeOption = VIEWPORT_OPTIONS.find((o) => o.value === viewport);

  return (
    <div className="flex min-h-0 flex-1 items-start justify-center">
      <iframe
        src={url}
        title={title}
        className={viewport !== "desktop" ? "border" : undefined}
        style={{
          width: activeOption?.width ?? "100%",
          height: activeOption?.height ?? "100%",
          maxHeight: "100%",
        }}
      />
    </div>
  );
}
