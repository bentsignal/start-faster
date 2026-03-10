import { Image } from "@unpic/react";

import { Link } from "~/components/link";
import { useCollectionPageStore } from "~/features/collections/stores/collection-page-store";

export function CollectionHeroImage({ className }: { className?: string }) {
  const imageURL = useCollectionPageStore(
    (store) => store.collection?.image?.url,
  );
  const handle = useCollectionPageStore((store) => store.collection?.handle);

  if (imageURL === undefined) {
    return null;
  }

  return (
    <div className={className}>
      {handle ? (
        <Link to="/collections/$handle" params={{ handle }} className="block">
          <CollectionHeroImageContent url={imageURL} />
        </Link>
      ) : (
        <CollectionHeroImageContent url={imageURL} />
      )}
    </div>
  );
}

export function CollectionHeroImageContent({ url }: { url: string }) {
  const imageFromStore = useCollectionPageStore(
    (store) => store.collection?.image,
  );
  const titleFromStore = useCollectionPageStore(
    (store) => store.collection?.title,
  );

  const image = imageFromStore;
  const title = titleFromStore ?? "Collection";

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
