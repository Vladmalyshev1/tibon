import { eventCompanyImage } from "../../data/home";
import { ButtonLink } from "../ui/Button";
import { PhotoImage } from "../ui/PhotoTile";

export function AdditionalServicesSection() {
  return (
    <section className="home-section services-callout" aria-labelledby="services-title">
      <div className="container-default services-callout-grid">
        <div className="services-callout-action">
          <div>
            <p className="type-overline">Дополнительные услуги</p>
            <h2 id="services-title" className="type-h2">Добавьте к событию то, что поддержит его настроение</h2>
          </div>
          <p>Продумайте детали вечера с учётом повода и выбранного формата.</p>
          <ButtonLink to="/dop-uslugi/" variant="outline">Все услуги</ButtonLink>
        </div>
        <div className="services-callout-photo" data-editorial-reveal><PhotoImage photo={eventCompanyImage} /></div>
      </div>
    </section>
  );
}
