import { ImageBlockWrapper } from "@acme/ui/image-block";

import { Image } from "~/components/image";
import { env } from "~/env";

function toConvexSiteUrl(url: string) {
  return url.includes(".cloud") ? url.replace(".cloud", ".site") : url;
}

const convexSiteUrl = toConvexSiteUrl(env.VITE_CONVEX_URL);

function buildImageUrl({
  downloadToken,
  fileName,
}: {
  downloadToken: string;
  fileName: string;
}) {
  const params = new URLSearchParams({
    token: downloadToken,
    filename: fileName,
  });
  return `${convexSiteUrl.replace(/\/$/, "")}/files/download?${params.toString()}`;
}

export function ImageBlockView({
  downloadToken,
  fileName,
  alt,
  widthScale,
}: {
  downloadToken: string;
  fileName: string;
  alt: string;
  widthScale: number;
}) {
  const src = buildImageUrl({ downloadToken, fileName });

  return (
    <ImageBlockWrapper widthScale={widthScale}>
      <Image
        src={src}
        alt={alt || fileName}
        width={1280}
        height={960}
        sizes="(min-width: 1024px) 800px, 100vw"
        preserveSearch
        className="h-auto w-full rounded-lg object-contain"
      />
    </ImageBlockWrapper>
  );
}
