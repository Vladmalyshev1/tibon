import { Link } from "react-router";
import { eventFormats } from "../../data/home";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "./Reveal";

export function EventsSection() {
  return (
    <section className="home-section events-section" aria-labelledby="events-title">
      <div className="container-default">
        <Reveal><SectionHeading id="events-title" title="Поводы собраться" overline="События" lead="Кулинарный процесс может стать естественной частью праздника или камерного вечера." /></Reveal>
        <div className="events-grid">
          {eventFormats.map((event, index) => (
            <Reveal key={event.title} delay={index * 0.08}>
              <article className="event-card">
                <div className="event-card-image">
                  <img src={event.image.src} width={event.image.width} height={event.image.height} alt={event.image.alt} loading="lazy" decoding="async" />
                </div>
                <div className="event-card-body">
                  <h3 className="type-h3">{event.title}</h3>
                  <p>{event.description}</p>
                  <Link className="button-text" to={event.to} aria-label={`Открыть формат: ${event.title}`}>Открыть формат</Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
