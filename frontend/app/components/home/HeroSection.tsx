import { Link } from "react-router";
import { ButtonLink } from "../ui/Button";
import { homeImages } from "../../data/home";
export function HeroSection() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="container-default home-hero-grid">
        <div className="home-hero-copy">
          <p className="type-overline">Кулинарная студия TIBON</p>
          <h1 id="home-title" className="type-display">Готовить вместе — это событие</h1>
          <p className="type-lead">Место для вкуса, разговора и совместного приготовления. Выберите формат, который подойдёт вашему поводу.</p>
          <div className="hero-actions">
            <ButtonLink to="/zayavka/" size="lg">Оставить заявку</ButtonLink>
            <Link className="button-text" to="#directions">Смотреть направления <span aria-hidden="true">↓</span></Link>
          </div>
        </div>
        <figure className="home-hero-media">
          <img
            src={homeImages.hero.src}
            srcSet="/images/home/preparation-small.webp 640w, /images/home/preparation.webp 960w"
            sizes="(min-width: 1920px) 1232px, (min-width: 768px) min(65vw, calc(50vw + 17rem)), 100vw"
            width={homeImages.hero.width}
            height={homeImages.hero.height}
            alt={homeImages.hero.alt}
            fetchPriority="high"
          />
        </figure>
      </div>
    </section>
  );
}
