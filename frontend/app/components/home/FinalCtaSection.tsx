import { StudioPhones } from "../ui/StudioPhones";
import { ButtonLink } from "../ui/Button";
import { LineIcon } from "../ui/LineIcon";

export function FinalCtaSection() {
  return (
    <section className="home-scene final-cta" aria-labelledby="final-cta-title">
      <div className="container-default home-scene-inner">
        <div className="home-scene-copy">
          <p className="cinematic-kicker">Бронирование</p>
          <h2 id="final-cta-title" className="type-h2">Забронируйте<br />дату</h2>
          <p className="home-summary">Расскажите о своём поводе. Обсудим формат, меню и дату.</p>
          <div className="final-cta-actions">
            <ButtonLink to="/zayavka/" size="lg">Забронировать <LineIcon name="arrow" /></ButtonLink>
            <StudioPhones />
          </div>
        </div>
      </div>
    </section>
  );
}
