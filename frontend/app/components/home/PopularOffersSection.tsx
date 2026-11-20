import { Link } from "react-router";
import { popularOffers } from "../../data/home";
import { SectionHeading } from "../ui/SectionHeading";

export function PopularOffersSection() {
  return (
    <section className="home-section offers-section" aria-labelledby="offers-title">
      <div className="container-default">
        <div><SectionHeading id="offers-title" title="Что попробовать" overline="Подборка форматов" /></div>
        <div className="offers-grid">
          {popularOffers.map((offer) => (
            <div key={offer.title}>
              <article className="offer-card">
                <div className="offer-card-media">
                  <img src={offer.image.src} width={offer.image.width} height={offer.image.height} alt={offer.image.alt} loading="lazy" decoding="async" />
                </div>
                <div className="offer-card-content">
                  <h3 className="type-h3">{offer.title}</h3>
                  <p>{offer.description}</p>
                  <Link className="button-text" to={offer.to} aria-label={`Узнать больше: ${offer.title}`}>
                    Узнать больше <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
