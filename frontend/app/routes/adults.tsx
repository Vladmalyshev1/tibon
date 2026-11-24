import { Link } from "react-router";
import { adultGroup, formatPrice, requestActionFor, romanticDinner, servicePages } from "../data/business";
import { homeImages, preparationImage } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { AdultGroupFacts, BookingFAQ, EventFacts } from "../components/pages/ServiceContent";
import { ImageTextSection } from "../components/pages/ImageTextSection";
import { PageCTA } from "../components/pages/PageCTA";
import { ButtonLink } from "../components/ui/Button";
import { LineIcon } from "../components/ui/LineIcon";
import { PhotoImage } from "../components/ui/PhotoTile";
import "../styles/adults.css";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.adults);

const heroPhoto = {
  src: "/images/studio/adults-hero-1672.webp",
  srcSet: "/images/studio/adults-hero-640.webp 640w, /images/studio/adults-hero-800.webp 800w, /images/studio/adults-hero-960.webp 960w, /images/studio/adults-hero-1672.webp 1672w",
  avifSrcSet: "/images/studio/adults-hero-640.avif 640w, /images/studio/adults-hero-800.avif 800w, /images/studio/adults-hero-960.avif 960w, /images/studio/adults-hero-1672.avif 1672w",
  sizes: "100vw",
  alt: "Стейк и закуски на тёмном столе",
  width: 1672,
  height: 941,
};

const adultEvents = [
  { id: "birthday", label: "День рождения" },
  { id: "corporate", label: "Корпоратив" },
  { id: "romantic", label: "Романтический ужин" },
] as const;

export default function Adults() {
  const action = requestActionFor("adults");
  return (
    <main id="main-content" className="adults-page" tabIndex={-1}>
      <section className="hero adults-hero" aria-labelledby="adults-title">
        <div className="adults-hero-media"><PhotoImage photo={heroPhoto} priority /></div>
        <div className="hero-container">
          <div className="adults-hero-copy">
            <h1 id="adults-title" className="type-display">
              <span>Кулинарные мастер-классы</span>{" "}<em>для взрослых</em>
            </h1>
            <p className="type-lead">{servicePages.adults.description}</p>
            <ButtonLink to={action.to} size="lg">{action.label} <LineIcon name="arrow" /></ButtonLink>
          </div>
        </div>
      </section>
      <div className="adults-facts">
        <div className="container-default"><AdultGroupFacts /></div>
      </div>
      <ImageTextSection title="Два формата вечера" className="adults-formats" image={preparationImage}>
        <div className="adults-format-notes">
          <div>
            <h3 className="type-h3">Мастер-класс</h3>
            <p>Готовите вместе с шефом. На приготовление отводится {adultGroup.cooking}. После него можно попробовать блюда за общим столом.</p>
          </div>
          <div>
            <h3 className="type-h3">Ресторанный формат</h3>
            <p>Шеф готовит выбранное меню для вашей компании.</p>
          </div>
        </div>
        <ButtonLink to={servicePages.extras.path} variant="text">Дополнительные услуги <LineIcon name="arrow" /></ButtonLink>
      </ImageTextSection>
      <section className="adult-events" aria-labelledby="adult-events-title">
        <div className="container-default adult-events-intro">
          <h2 id="adult-events-title" className="type-h2">Выберите повод</h2>
          <nav aria-label="Форматы для взрослых">
            <ul>
              {adultEvents.map(({ id, label }) => (
                <li key={id}><a className="button-text" href={`#${id}`}>{label}</a></li>
              ))}
            </ul>
          </nav>
        </div>
        <ImageTextSection id="birthday" title={servicePages.birthday.title} className="adult-event adult-event-birthday"
          image={homeImages.birthday} imageSide="right">
          <p>На <Link className="underline" to={servicePages.birthday.path}>кулинарный день рождения</Link> пригласите близких и приготовьте выбранное меню вместе с шефом.</p>
          <p>Стоимость зависит от выбранного меню и числа гостей.</p>
          <AdultGroupFacts />
          <ButtonLink to={requestActionFor("birthday").to} variant="outline">Обсудить день рождения <LineIcon name="arrow" /></ButtonLink>
        </ImageTextSection>
        <ImageTextSection id="corporate" title={servicePages.corporate.title} className="adult-event adult-event-corporate"
          image={homeImages.table}>
          <p>На <Link className="underline" to={servicePages.corporate.path}>кулинарном корпоративе</Link> команда готовит с шефом {adultGroup.cooking}, а затем пробует блюда за общим столом.</p>
          <AdultGroupFacts />
          <ButtonLink to={requestActionFor("corporate").to} variant="outline">Обсудить корпоратив <LineIcon name="arrow" /></ButtonLink>
        </ImageTextSection>
        <ImageTextSection id="romantic" title={servicePages.romantic.title} className="adult-event adult-event-romantic"
          image={{ ...homeImages.dinner, focalPoint: "50% 54%" }} imageSide="right">
          <p><Link className="underline" to={servicePages.romantic.path}>Романтический ужин</Link> для двоих включает три блюда и кулинарный мастер-класс.</p>
          <EventFacts items={[
            ["Стоимость", formatPrice(romanticDinner.price)],
            ["Аренда студии", romanticDinner.rentalDuration],
            ["В программе", romanticDinner.show],
          ]} />
          <ButtonLink to={requestActionFor("romantic").to} variant="outline">Подобрать дату ужина <LineIcon name="arrow" /></ButtonLink>
        </ImageTextSection>
      </section>
      <ImageTextSection title="Что приготовим" className="adults-menu" imageSide="right"
        image={{ ...homeImages.pasta, src: "/images/home/pasta-cinematic.webp" }}>
        <p>В каждом из четырёх взрослых меню можно выбрать салат, горячее и десерт. Актуальные варианты доступны в PDF.</p>
        <ButtonLink to="/menu/#menu-download" variant="outline">Смотреть меню <LineIcon name="arrow" /></ButtonLink>
      </ImageTextSection>
      <BookingFAQ includeRomanticDinner />
      <PageCTA title="Какой повод планируете?" description="Укажите дату и число гостей при обращении в студию." action={action} layout="inline" />
    </main>
  );
}
