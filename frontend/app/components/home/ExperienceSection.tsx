import { Link } from "react-router";
import { servicePages } from "../../data/business";
import { eventCompanyImage, homeImages } from "../../data/home";
import { ButtonLink } from "../ui/Button";
import { LineIcon } from "../ui/LineIcon";
import { PhotoImage } from "../ui/PhotoTile";

export function ExperienceSection() {
  return (
    <>
      <section className="home-scene home-menu-feature" aria-labelledby="home-menu-title">
        <div className="home-scene-media"><PhotoImage photo={{ ...homeImages.pasta, src: "/images/home/pasta-cinematic.webp" }} /></div>
        <div className="container-default home-scene-inner">
          <div className="home-scene-copy">
            <p className="cinematic-kicker">Меню</p>
            <h2 id="home-menu-title" className="type-h2">Авторские<br />меню</h2>
            <p className="home-summary">Взрослые и детские наборы, авторские блюда, стейки и закуски.</p>
            <ButtonLink to={servicePages.menu.path} variant="outline">Посмотреть меню <LineIcon name="arrow" /></ButtonLink>
          </div>
        </div>
      </section>
      <section className="home-scene home-events" aria-labelledby="events-title">
        <div className="home-scene-media"><PhotoImage photo={eventCompanyImage} /></div>
        <div className="container-default home-scene-inner">
          <div className="home-scene-copy">
            <p className="cinematic-kicker">События</p>
            <h2 id="events-title" className="type-h2">Праздники<br />в стиле Ти-Бон</h2>
            <p className="home-summary">Дни рождения, романтические ужины, семейные встречи и корпоративы за общим столом.</p>
            <Link className="home-text-link" to="/zayavka/">Организовать праздник <LineIcon name="arrow" /></Link>
            <Link className="home-text-link" to={servicePages.extras.path}>Дополнить программу <LineIcon name="arrow" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
