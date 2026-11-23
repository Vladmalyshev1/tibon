import { extraServices, formatPrice, requestAction, servicePages } from "../data/business";
import { eventCompanyImage } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { ReferenceHero } from "../components/pages/ReferenceHero";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";
import { ImageTextSection } from "../components/pages/ImageTextSection";
import { LineIcon } from "../components/ui/LineIcon";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.extras);

const eventFormats = [
  "Детские дни рождения.",
  "Выпускные вечера.",
  "Авторские квесты.",
  "Тематические вечеринки.",
  "Корпоративы и тимбилдинги.",
];
const hostPhoto = { src: "/images/studio/podkin.jpg", alt: "Александр Подкин", width: 1280, height: 1280 };
const groupHero = {
  ...eventCompanyImage,
  src: "/images/studio/druzya-hero.webp",
  srcSet: "/images/studio/druzya-hero-small.webp 540w, /images/studio/druzya-hero.webp 1086w",
  sizes: "(min-width: 48rem) 63vw, 100vw",
  height: 1026,
};

export default function Services() {
  return (
    <main id="main-content" className="service-page cinematic-page extras-page" tabIndex={-1}>
      <ReferenceHero page="extras" lines={["Дополнительные", "услуги для", "праздника"]} image={groupHero}>
        <nav className="extras-index" aria-label="Разделы услуг">
          <a href="#services-list">Услуги и цены</a>
          <a href="#event-team">Ивент-компания</a>
        </nav>
      </ReferenceHero>
      <PageSection id="event-team" title="Весело. Оригинально. Со вкусом." overline="Ивент-компания «Друзья»"
        description="Кулинарный мастер-класс можно дополнить играми, ведущим или фотосъёмкой."
        tone="alternate" className="event-company">
        <div className="event-company-details">
          <div>
            <h3 className="type-h3">Что можно добавить</h3>
            <ul className="event-company-facts" role="list">
              <li>Игры для компании — <strong>«Мафия» или «Бункер».</strong></li>
              <li>Командный квиз и детская анимация.</li>
              <li>Ведущий и фотограф на мероприятие.</li>
            </ul>
            <p>Услуги и дату можно согласовать со студией при бронировании.</p>
          </div>
          <div>
            <h3 className="type-h3">Какие мероприятия организуем</h3>
            <ul className="event-company-formats" role="list">
              {eventFormats.map((format) => <li key={format}>{format}</li>)}
            </ul>
          </div>
        </div>
      </PageSection>
      <ImageTextSection title="Ведущий Александр Подкин" image={hostPhoto} imageSide="right" className="extras-host">
        <p className="type-lead">Мы сотрудничаем с проверенным ведущим.</p>
        <ButtonLink to={requestAction.to} variant="outline">Запросить ведущего <LineIcon name="arrow" /></ButtonLink>
      </ImageTextSection>
      <PageSection id="services-list" title="Что можно добавить к мастер-классу" className="extras-ledger" tone="alternate">
        <ul className="extras-list" role="list">
          {extraServices.map((service) => (
            <li id={service.id} key={service.id}>
              <h3 className="type-h3">{service.title}</h3>
              <p>{service.description}</p>
              <p className="extras-price">{service.price ? formatPrice(service.price) : service.priceNote}</p>
              <ButtonLink to={requestAction.to} variant="text" aria-label={`Запросить: ${service.title}`}>
                Запросить <span aria-hidden="true">↗</span>
              </ButtonLink>
            </li>
          ))}
        </ul>
      </PageSection>
      <PageCTA title="Согласовать услуги для вашего праздника" description="Сообщите дату встречи и какие услуги вас интересуют." action={requestAction} layout="inline" />
    </main>
  );
}
