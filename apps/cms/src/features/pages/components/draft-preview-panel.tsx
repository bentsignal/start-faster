import type { Viewport } from "~/features/pages/components/viewport-controls";
import { PreviewIframe } from "~/features/pages/components/preview-iframe";

export function DraftPreviewPanel({
  url,
  viewport,
}: {
  url: string;
  viewport: Viewport;
}) {
  return (
    <PreviewIframe url={url} title={`Preview of draft`} viewport={viewport} />
  );
}
