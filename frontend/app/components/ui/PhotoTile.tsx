import type { CSSProperties } from "react";
import { preload } from "react-dom";

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  avifSrcSet?: string;
  sizes?: string;
  focalPoint?: CSSProperties["objectPosition"];
};

export function PhotoImage({ photo, priority = false }: { photo: Photo; priority?: boolean }) {
  if (priority && photo.avifSrcSet) {
    preload(photo.src, {
      as: "image",
      type: "image/avif",
      imageSrcSet: photo.avifSrcSet,
      imageSizes: photo.sizes,
      fetchPriority: "high",
    });
  }

  const image = (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={photo.sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      style={{ objectPosition: photo.focalPoint }}
      loading={priority ? undefined : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? undefined : "async"}
    />
  );

  if (!photo.avifSrcSet) return image;
  return (
    <picture>
      <source type="image/avif" srcSet={photo.avifSrcSet} sizes={photo.sizes} />
      {image}
    </picture>
  );
}

export function PhotoTile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-haspopup="dialog" aria-label={`Открыть фото: ${photo.alt}`}>
      <PhotoImage photo={photo} />
      <span aria-hidden="true">+</span>
    </button>
  );
}
