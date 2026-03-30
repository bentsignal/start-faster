import { QuickLink } from "@acme/features/quick-link";

import { Image } from "~/components/image";
import { useCollectionProducts } from "~/features/collections/hooks/use-collection-products";

export function CollectionHeroImage({ className }: { className?: string }) {
  const { collection } = useCollectionProducts();
  const imageURL = collection?.image?.url;
  const handle = collection?.handle;

  if (imageURL === undefined) {
    return null;
  }

  return (
    <div className={className}>
      {handle ? (
        <QuickLink
          to="/collections/$handle"
          params={{ handle }}
          className="block"
        >
          <CollectionHeroImageContent url={imageURL} />
        </QuickLink>
      ) : (
        <CollectionHeroImageContent url={imageURL} />
      )}
    </div>
  );
}

function CollectionHeroImageContent({ url }: { url: string }) {
  const { collection } = useCollectionProducts();
  const image = collection?.image;
  const title = collection?.title ?? "Collection";

  return (
    <Image
      src={url}
      alt={image?.altText ?? `${title} collection`}
      width={image?.width ?? 1400}
      height={image?.height ?? 560}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className="bg-muted w-full rounded-xl object-cover"
    />
  );
}
