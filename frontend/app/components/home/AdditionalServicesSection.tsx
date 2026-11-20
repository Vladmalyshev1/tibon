import { eventCompanyImage } from "../../data/home";
import { ButtonLink } from "../ui/Button";
import { PhotoImage } from "../ui/PhotoTile";
import { Reveal } from "./Reveal";

export function AdditionalServicesSection() {
  return (
    <section className="home-section services-callout" aria-labelledby="services-title">
      <div className="container-default services-callout-grid">
        <Reveal className="services-callout-action">
          <div>
            <p className="type-overline">Дополнительные услуги</p>
            <h2 id="services-title" className="type-h2">Добавьте к событию то, что поддержит его настроение</h2>
          </div>
          <p>Продумайте детали вечера с учётом повода и выбранного формата.</p>
          <ButtonLink to="/dop-uslugi/" variant="outline">Все услуги</ButtonLink>
        </Reveal>
        <div className="services-callout-photo"><PhotoImage photo={eventCompanyImage} /></div>
      </div>
    </section>
  );
}
