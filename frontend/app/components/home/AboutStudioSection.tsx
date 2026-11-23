import { preparationImage } from "../../data/home";
import { PhotoImage } from "../ui/PhotoTile";

export function AboutStudioSection() {
  return (
    <section id="about-studio" className="home-scene home-about" aria-labelledby="about-title" tabIndex={-1}>
      <div className="home-scene-media"><PhotoImage photo={preparationImage} /></div>
      <div className="container-default home-scene-inner">
        <div className="home-scene-copy">
          <p className="cinematic-kicker">О студии</p>
          <h2 id="about-title" className="type-h2">Больше, чем<br />просто готовка</h2>
          <p className="home-summary">В студии Рената Исмагилова гости готовят вместе с шефом. Он показывает приёмы, помогает с блюдами, а за ужином можно попробовать всё, что приготовили.</p>
        </div>
      </div>
    </section>
  );
}
