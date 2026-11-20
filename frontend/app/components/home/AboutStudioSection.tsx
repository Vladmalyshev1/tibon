import { ButtonLink } from "../ui/Button";
import { homeImages } from "../../data/home";
import { Reveal } from "./Reveal";

export function AboutStudioSection() {
  return (
    <section className="home-section about-section" aria-labelledby="about-title">
      <div className="container-default about-grid">
        <Reveal className="about-media">
          <img src={homeImages.studio.src} width={homeImages.studio.width} height={homeImages.studio.height} alt={homeImages.studio.alt} loading="lazy" decoding="async" />
          <p className="home-photo-note">Иллюстрация кухонного пространства</p>
        </Reveal>
        <Reveal className="about-copy" delay={0.08}>
          <p className="type-overline">О пространстве</p>
          <h2 id="about-title" className="type-h2">Кухня как место встречи</h2>
          <p className="type-lead">В TIBON приготовление становится поводом быть рядом: выбирать продукты, пробовать, обсуждать и создавать вечер вместе.</p>
          <ButtonLink to="#directions" variant="secondary">Смотреть направления</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
