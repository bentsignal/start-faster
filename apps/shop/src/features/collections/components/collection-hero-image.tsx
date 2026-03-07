import { Image } from "@unpic/react";

import { Link } from "~/components/link";
import { useCollectionPageStore } from "~/features/collections/stores/collection-page-store";

export function CollectionHeroImage() {
  const imageFromStore = useCollectionPageStore(
    (store) => store.collection?.image,
  );
  const titleFromStore = useCollectionPageStore(
    (store) => store.collection?.title,
  );
  const handle = useCollectionPageStore((store) => store.collection?.handle);

  const image = imageFromStore;
  const title = titleFromStore ?? "Collection";

  if (image?.url === undefined) {
    return null;
  }

  const media = (
    <Image
      src={image.url}
      alt={image.altText ?? `${title} collection`}
      width={image.width ?? 1400}
      height={image.height ?? 560}
      className="bg-muted w-full rounded-xl object-cover"
    />
  );

  if (handle === undefined) {
    return media;
  }

  return (
    <Link to="/collections/$handle" params={{ handle }} className="block">
      {media}
    </Link>
  );
}
