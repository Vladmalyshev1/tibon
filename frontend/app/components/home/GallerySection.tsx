import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, ButtonLink } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { SectionHeading } from "../ui/SectionHeading";
import { galleryImages } from "../../data/home";
import { Reveal } from "./Reveal";

export function GallerySection() {
  const [index, setIndex] = useState<number | null>(null);
  const selectedImage = index === null ? undefined : galleryImages[index];
  const reducedMotion = useReducedMotion();

  function step(offset: number) {
    setIndex((current) => current === null ? current : (current + offset + galleryImages.length) % galleryImages.length);
  }
  return (
    <section className="home-section gallery-section" aria-labelledby="gallery-title">
      <div className="container-wide">
        <Reveal><SectionHeading id="gallery-title" title="Вкус в деталях" overline="Галерея" lead="Иллюстрации кулинарного процесса и сервировки." /></Reveal>
        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <Reveal key={image.src} delay={index * 0.05} className={`gallery-item gallery-item-${index + 1}`}>
              <button type="button" onClick={() => setIndex(index)} aria-haspopup="dialog" aria-label={`Открыть фото: ${image.alt}`}>
                <img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" />
                <span>Открыть <span aria-hidden="true">↗</span></span>
              </button>
            </Reveal>
          ))}
        </div>
        <Reveal className="gallery-link"><ButtonLink to="/galereya/" variant="secondary">Вся галерея</ButtonLink></Reveal>
      </div>
      <Modal
        open={index !== null}
        title="Фотография"
        onClose={() => setIndex(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            step(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {selectedImage && index !== null ? (
          <>
            <motion.figure
              key={selectedImage.src}
              className="gallery-lightbox-figure"
              initial={reducedMotion ? false : { opacity: 0.65 }}
              animate={{ opacity: 1 }}
            >
              <img src={selectedImage.src} width={selectedImage.width} height={selectedImage.height} alt={selectedImage.alt} />
              <figcaption aria-live="polite">{index + 1} из {galleryImages.length}. {selectedImage.alt}</figcaption>
            </motion.figure>
            <div className="gallery-controls">
              <Button type="button" variant="text" onClick={() => step(-1)}>Предыдущее</Button>
              <Button type="button" variant="text" onClick={() => step(1)}>Следующее</Button>
            </div>
          </>
        ) : null}
      </Modal>
    </section>
  );
}
