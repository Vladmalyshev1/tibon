import { ButtonLink } from "../ui/Button";
import { LineIcon } from "../ui/LineIcon";
import { PhotoImage } from "../ui/PhotoTile";
import { founderImage } from "../../data/home";

const studioBenefits = [
  { icon: "chef", lines: ["Профессиональный", "шеф"] },
  { icon: "cutlery", lines: ["Авторские", "рецепты"] },
  { icon: "group", lines: ["Форматы", "для разных событий"] },
  { icon: "pin", lines: ["Студия рядом", "с Ижевском"] },
] as const;

export function HeroSection() {
  return (
    <>
      <section className="hero home-hero" aria-labelledby="home-title">
        <div className="home-hero-portrait">
          <PhotoImage photo={{ ...founderImage, sizes: "(min-width: 56rem) 58vw, (min-width: 40rem) 62vw, 83vw" }} priority />
        </div>
        <div className="home-hero-food" aria-hidden="true" />
        <div className="hero-container home-hero-inner">
          <div className="home-hero-copy">
            <p className="cinematic-kicker">Кулинарная студия ТИ-БОН</p>
            <h1 id="home-title" className="type-display">
              <span>Ти-Бон — это не просто</span>{" "}
              <span>кулинарная студия,</span>{" "}
              <em><span>а настоящее</span>{" "}<span>гастрономическое</span>{" "}<span>путешествие,</span></em>
            </h1>
            <p className="type-lead">где в одном блюде собрана целая палитра вкусов и эмоций.</p>
            <div className="hero-actions">
              <ButtonLink to="#directions" size="lg">Выбрать программу <LineIcon name="arrow" /></ButtonLink>
            </div>
          </div>
        </div>
      </section>
      <ul className="home-benefits" aria-label="Преимущества студии">
        {studioBenefits.map(({ icon, lines }) => (
          <li key={icon}><LineIcon name={icon} /><span>{lines[0]}<br />{lines[1]}</span></li>
        ))}
      </ul>
    </>
  );
}
