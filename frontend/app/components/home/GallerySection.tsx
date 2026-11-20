import { useState } from "react";
import { GalleryLightbox } from "../ui/GalleryLightbox";
import { PhotoTile } from "../ui/PhotoTile";
import { SectionHeading } from "../ui/SectionHeading";
import { galleryImages } from "../../data/home";

export function GallerySection() {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section className="home-section gallery-section" aria-labelledby="gallery-title">
      <div className="container-default">
        <div data-editorial-reveal><SectionHeading id="gallery-title" title="Вкус в деталях" overline="Галерея" lead="Иллюстрации кулинарного процесса и сервировки." /></div>
        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <div key={image.src} className={`gallery-item gallery-item-${index + 1}`}>
              <PhotoTile photo={image} onOpen={() => setIndex(index)} />
            </div>
          ))}
        </div>
      </div>
      <GalleryLightbox images={galleryImages} index={index} onIndexChange={setIndex} />
    </section>
  );
}
