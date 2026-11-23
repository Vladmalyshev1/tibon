import { adultGroup, formatPrice, requestAction, romanticDinner, servicePages } from "../data/business";
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

const adultEvents = [
  { id: "birthday", label: "День рождения" },
  { id: "corporate", label: "Корпоратив" },
  { id: "romantic", label: "Романтический ужин" },
] as const;

export default function Adults() {
  return (
    <main id="main-content" className="adults-page" tabIndex={-1}>
      <section className="hero adults-hero" aria-labelledby="adults-title">
        <div className="adults-hero-media"><PhotoImage photo={homeImages.corporate} priority /></div>
        <div className="hero-container">
          <div className="adults-hero-copy">
            <h1 id="adults-title" className="type-display">
              <span>Кулинарные мастер-классы</span>{" "}<em>для взрослых</em>
            </h1>
            <p className="type-lead">{servicePages.adults.description}</p>
            <ButtonLink to={requestAction.to} size="lg">{requestAction.label} <LineIcon name="arrow" /></ButtonLink>
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
          <p>{servicePages.birthday.description}</p>
          <p>Стоимость зависит от выбранного меню и числа гостей.</p>
          <AdultGroupFacts />
          <ButtonLink to={requestAction.to} variant="outline">Обсудить день рождения <LineIcon name="arrow" /></ButtonLink>
        </ImageTextSection>
        <ImageTextSection id="corporate" title={servicePages.corporate.title} className="adult-event adult-event-corporate"
          image={homeImages.table}>
          <p>{servicePages.corporate.description} Кулинарная часть занимает {adultGroup.cooking}.</p>
          <AdultGroupFacts />
          <ButtonLink to={requestAction.to} variant="outline">Обсудить корпоратив <LineIcon name="arrow" /></ButtonLink>
        </ImageTextSection>
        <ImageTextSection id="romantic" title={servicePages.romantic.title} className="adult-event adult-event-romantic"
          image={{ ...homeImages.dinner, focalPoint: "50% 54%" }} imageSide="right">
          <p>Гастрономический ужин из трёх блюд с кулинарным мастер-классом.</p>
          <EventFacts items={[
            ["Стоимость", formatPrice(romanticDinner.price)],
            ["Аренда студии", romanticDinner.rentalDuration],
            ["В программе", romanticDinner.show],
          ]} />
          <ButtonLink to={requestAction.to} variant="outline">Подобрать дату ужина <LineIcon name="arrow" /></ButtonLink>
        </ImageTextSection>
      </section>
      <ImageTextSection title="Что приготовим" className="adults-menu" imageSide="right"
        image={{ ...homeImages.pasta, src: "/images/home/pasta-cinematic.webp" }}>
        <p>Скачайте актуальное меню, чтобы посмотреть варианты блюд для вашего мероприятия.</p>
        <ButtonLink to="/menu/#menu-download" variant="outline">Смотреть меню <LineIcon name="arrow" /></ButtonLink>
      </ImageTextSection>
      <BookingFAQ includeRomanticDinner />
      <PageCTA title="Какой повод планируете?" description="Укажите дату и число гостей при обращении в студию." action={requestAction} layout="inline" />
    </main>
  );
}
