import { useState } from "react";
import { ButtonLink } from "../ui/Button";
import { GalleryLightbox } from "../ui/GalleryLightbox";
import { PhotoTile } from "../ui/PhotoTile";
import { SectionHeading } from "../ui/SectionHeading";
import { galleryImages } from "../../data/home";
import { Reveal } from "./Reveal";

export function GallerySection() {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section className="home-section gallery-section" aria-labelledby="gallery-title">
      <div className="container-default">
        <Reveal><SectionHeading id="gallery-title" title="Вкус в деталях" overline="Галерея" lead="Иллюстрации кулинарного процесса и сервировки." /></Reveal>
        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <Reveal key={image.src} delay={index * 0.05} className={`gallery-item gallery-item-${index + 1}`}>
              <PhotoTile photo={image} onOpen={() => setIndex(index)} />
            </Reveal>
          ))}
        </div>
        <Reveal className="gallery-link"><ButtonLink to="/galereya/" variant="secondary">Вся галерея</ButtonLink></Reveal>
      </div>
      <GalleryLightbox images={galleryImages} index={index} onIndexChange={setIndex} />
    </section>
  );
}
