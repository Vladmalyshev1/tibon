import { Link } from "react-router";
import { directions, occasions } from "../../data/home";
import { LineIcon } from "../ui/LineIcon";
import { PhotoImage } from "../ui/PhotoTile";

export function DirectionsSection() {
  return (
    <section id="directions" className="home-directions" aria-labelledby="directions-title" tabIndex={-1}>
      <div className="container-default">
        <div className="home-section-heading">
          <p className="cinematic-kicker">Программы</p>
          <h2 id="directions-title" className="type-h2">Выберите свой<br />формат</h2>
        </div>
        <ul className="directions-grid">
          {directions.map(({ title, description, to, image, illustration }) => (
            <li key={to}>
              <Link to={to} className="direction-link">
                <div className="direction-media">
                  <PhotoImage photo={image} />
                  {illustration ? <span className="direction-image-label">Иллюстрация</span> : null}
                </div>
                <div className="direction-copy">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <LineIcon name="arrow" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="occasions-list">
          {occasions.map(({ title, description, to }) => (
            <li key={to}>
              <Link to={to}>
                <h3>{title}</h3>
                <p>{description}</p>
                <LineIcon name="arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
