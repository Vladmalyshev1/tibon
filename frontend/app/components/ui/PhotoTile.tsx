import type { CSSProperties } from "react";

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
  focalPoint?: CSSProperties["objectPosition"];
};

export function PhotoImage({ photo, priority = false }: { photo: Photo; priority?: boolean }) {
  return (
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
}

export function PhotoTile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-haspopup="dialog" aria-label={`Открыть фото: ${photo.alt}`}>
      <PhotoImage photo={photo} />
      <span aria-hidden="true">+</span>
    </button>
  );
}
