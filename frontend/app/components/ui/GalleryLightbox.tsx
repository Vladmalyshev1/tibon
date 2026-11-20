import { motion, useReducedMotion } from "framer-motion";
import { Button } from "./Button";
import { Modal } from "./Modal";
import type { Photo } from "./PhotoTile";

type GalleryLightboxProps = {
  images: readonly Photo[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

export function GalleryLightbox({ images, index, onIndexChange }: GalleryLightboxProps) {
  const selectedImage = index === null ? undefined : images[index];
  const reducedMotion = useReducedMotion();
  const hasMultipleImages = images.length > 1;

  function step(offset: number) {
    if (index !== null && hasMultipleImages) {
      onIndexChange((index + offset + images.length) % images.length);
    }
  }

  return (
    <Modal
      open={selectedImage !== undefined}
      title="Фотография"
      onClose={() => onIndexChange(null)}
      onKeyDown={(event) => {
        if (hasMultipleImages && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault();
          step(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      {selectedImage && index !== null ? (
        <>
          <figure className="gallery-lightbox-figure">
            <motion.img
              key={selectedImage.src}
              src={selectedImage.src}
              width={selectedImage.width}
              height={selectedImage.height}
              alt={selectedImage.alt}
              initial={reducedMotion ? false : { opacity: 0.65 }}
              animate={{ opacity: 1 }}
            />
            <figcaption aria-live="polite">{index + 1} из {images.length}. {selectedImage.alt}</figcaption>
          </figure>
          {hasMultipleImages ? (
            <div className="gallery-controls">
              <Button type="button" variant="text" onClick={() => step(-1)}>Предыдущее</Button>
              <Button type="button" variant="text" onClick={() => step(1)}>Следующее</Button>
            </div>
          ) : null}
        </>
      ) : null}
    </Modal>
  );
}
