import { Link } from "react-router";
import { ButtonLink } from "../ui/Button";
import { PhotoImage } from "../ui/PhotoTile";
import { founderImage, founderName, studioHeading } from "../../data/home";

export function HeroSection() {
  return (
    <section className="home-hero" aria-labelledby="home-title" data-enter>
      <div className="container-default home-hero-grid">
        <figure className="home-hero-portrait">
          <PhotoImage photo={{ ...founderImage, sizes: "(min-width: 82rem) 26rem, (min-width: 64rem) 33vw, (min-width: 30rem) 18rem, 62vw" }} priority />
        </figure>
        <div className="home-hero-copy">
          <h1 id="home-title" className="type-display">{studioHeading} <span>{founderName}</span></h1>
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
