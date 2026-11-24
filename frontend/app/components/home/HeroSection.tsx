import { ButtonLink } from "../ui/Button";
import { LineIcon } from "../ui/LineIcon";
import { PhotoImage } from "../ui/PhotoTile";
import { founderImage } from "../../data/home";

const heroPortrait = {
  ...founderImage,
  src: "/images/home/hero-renat.webp",
  srcSet: "/images/home/hero-renat-small.webp 540w, /images/home/hero-renat.webp 940w",
  avifSrcSet: "/images/home/hero-renat-540.avif 540w, /images/home/hero-renat-720.avif 720w, /images/home/hero-renat-940.avif 940w",
  sizes: "(min-width: 40rem) min(56vw, 61rem), min(81vw, 30rem)",
  width: 940,
  height: 1672,
};

const studioBenefits = [
  { icon: "chef", lines: ["Профессиональный", "шеф"] },
  { icon: "cutlery", lines: ["Авторские", "рецепты"] },
  { icon: "group", lines: ["Форматы", "для разных событий"] },
  { icon: "pin", lines: ["Студия", "в Ижевске"] },
] as const;

export function HeroSection() {
  return (
    <>
      <section className="hero home-hero" aria-labelledby="home-title">
        <div className="home-hero-portrait">
          <PhotoImage photo={heroPortrait} priority />
        </div>
        <div className="hero-container home-hero-inner">
          <div className="home-hero-copy">
            <p className="cinematic-kicker">Кулинарная студия Рената Исмагилова</p>
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
