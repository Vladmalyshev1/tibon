import { Link } from "react-router";
import { popularOffers } from "../../data/home";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "./Reveal";

export function PopularOffersSection() {
  return (
    <section className="home-section offers-section" aria-labelledby="offers-title">
      <div className="container-default">
        <Reveal><SectionHeading id="offers-title" title="Что попробовать" overline="Подборка форматов" /></Reveal>
        <div className="offers-grid">
          {popularOffers.map((offer, index) => (
            <Reveal key={offer.title} delay={index * 0.08}>
              <article className="offer-card">
                <div className="offer-card-media">
                  <img src={offer.image.src} width={offer.image.width} height={offer.image.height} alt={offer.image.alt} loading="lazy" decoding="async" />
                </div>
                <div className="offer-card-content">
                  <h3 className="type-h3">{offer.title}</h3>
                  <p>{offer.description}</p>
                  <Link className="button-text" to={offer.to} aria-label={`Узнать больше: ${offer.title}`}>Узнать больше</Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
