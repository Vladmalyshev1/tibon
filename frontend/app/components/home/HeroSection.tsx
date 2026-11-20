import { Link } from "react-router";
import { ButtonLink } from "../ui/Button";
import { PhotoImage } from "../ui/PhotoTile";
import { founderImage, founderName, studioHeading } from "../../data/home";

export function HeroSection() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="container-default home-hero-grid">
        <h1 id="home-title" className="type-display">{studioHeading} <span>{founderName}</span></h1>
        <figure className="home-hero-media">
          <PhotoImage photo={founderImage} priority />
        </figure>
        <div className="home-hero-copy">
          <p className="type-lead">Место для вкуса, разговора и совместного приготовления. Выберите формат, который подойдёт вашему поводу.</p>
          <div className="hero-actions">
            <ButtonLink to="/zayavka/" size="lg">Оставить заявку</ButtonLink>
            <Link className="button-text" to="#directions">Смотреть направления <span aria-hidden="true">↓</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
