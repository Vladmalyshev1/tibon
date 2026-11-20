import { useState } from "react";
import { GalleryLightbox } from "../ui/GalleryLightbox";
import { PhotoTile, type Photo } from "../ui/PhotoTile";
import { PageSection } from "./PageSection";

type PageGalleryProps = {
  title: string;
  description?: string;
  images: readonly Photo[];
  layout?: "grid" | "mosaic";
};

export function PageGallery({ title, description, images, layout = "grid" }: PageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <PageSection title={title} description={description} tone="alternate">
      <GalleryContent images={images} layout={layout} />
    </PageSection>
  );
}

function GalleryContent({ images, layout }: { images: readonly Photo[]; layout: NonNullable<PageGalleryProps["layout"]> }) {
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const index = images.findIndex(({ src }) => src === selectedSrc);

  return (
    <>
      <ul className={`page-gallery-grid page-gallery-${layout}`} role="list">
        {images.map((image) => (
          <li key={image.src} className="gallery-item">
            <PhotoTile photo={image} onOpen={() => setSelectedSrc(image.src)} />
          </li>
        ))}
      </ul>
      <GalleryLightbox
        images={images}
        index={index < 0 ? null : index}
        onIndexChange={(nextIndex) => setSelectedSrc(nextIndex === null ? null : images[nextIndex].src)}
      />
    </>
  );
}
