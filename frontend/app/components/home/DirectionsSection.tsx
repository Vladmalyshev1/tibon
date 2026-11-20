import { Link } from "react-router";
import { directions } from "../../data/home";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "./Reveal";

export function DirectionsSection() {
  return (
    <section id="directions" className="home-section" aria-labelledby="directions-title">
      <div className="container-default">
        <Reveal><SectionHeading id="directions-title" title="Выберите своё направление" overline="Форматы" lead="От спокойного вечера до события, которое хочется разделить с близкими." /></Reveal>
        <div className="directions-grid">
          {directions.map((direction, index) => (
            <Reveal key={direction.title} delay={index * 0.08} className={`direction-card direction-card-${direction.layout ?? "portrait"}`}>
              <Link to={direction.to} className="image-card-link">
                <div className="image-card-media">
                  <img src={direction.image.src} width={direction.image.width} height={direction.image.height} alt={direction.image.alt} loading="lazy" decoding="async" />
                </div>
                <div className="image-card-content">
                  <h3 className="type-h3">{direction.title}</h3>
                  <p>{direction.description}</p>
                  <span className="image-card-arrow">Подробнее <span aria-hidden="true">↗</span></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
