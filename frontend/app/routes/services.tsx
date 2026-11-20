import { extraServices, formatPrice, requestAction, servicePages } from "../data/business";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { ServiceHero } from "../components/pages/ServiceContent";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";
import { PhotoImage } from "../components/ui/PhotoTile";
import { ImageTextSection } from "../components/pages/ImageTextSection";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.extras);

const eventFormats = [
  "Детские дни рождения от 1 до 18 лет.",
  "Выпускные вечера.",
  "Авторские квесты.",
  "Тематические вечеринки.",
  "Корпоративы и тимбилдинги.",
];
const hostPhoto = { src: "/images/studio/podkin.jpg", alt: "Александр Подкин", width: 1280, height: 1280 };
const eventPhoto = {
  src: "/images/studio/druzya.jpg",
  alt: "Участники мероприятия ивент-компании «Друзья» в студии TIBON",
  width: 1086,
  height: 1448,
};

export default function Services() {
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="extras" className="extras-hero" />
      <PageSection title="Весело. Оригинально. Со вкусом." overline="Ивент-компания «Друзья»"
        description="Мы создаём не просто праздники — мы создаём эмоции, которые остаются навсегда."
        tone="alternate" className="event-company">
        <div className="event-company-photo">
          <PhotoImage photo={eventPhoto} />
        </div>
        <div className="event-company-details">
          <div>
            <h3 className="type-h3">Почему нам доверяют</h3>
            <ul className="event-company-facts" role="list">
              <li>Работаем с <strong>2015 года.</strong></li>
              <li><strong>90% клиентов</strong> возвращаются к нам снова.</li>
              <li>Собственная база ресурсов и опыт реализации событий любого масштаба.</li>
            </ul>
            <p>Мы любим создавать праздники и знаем, как превратить вашу идею в красивое, яркое и незабываемое событие.</p>
          </div>
          <div>
            <h3 className="type-h3">Какие мероприятия организуем</h3>
            <ul className="event-company-formats" role="list">
              {eventFormats.map((format) => <li key={format}>{format}</li>)}
            </ul>
            <p><strong>Полный цикл организации — всё в одних руках.</strong></p>
          </div>
        </div>
      </PageSection>
      <ImageTextSection title="Ведущий Александр Подкин" image={hostPhoto} className="extras-host">
        <p className="type-lead">Мы сотрудничаем с проверенным ведущим.</p>
        <ButtonLink to={requestAction.to} variant="outline">Запросить ведущего</ButtonLink>
      </ImageTextSection>
      <PageSection title="Что можно добавить к мастер-классу" tone="alternate">
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
