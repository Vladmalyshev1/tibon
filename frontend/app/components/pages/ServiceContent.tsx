import type { ComponentProps } from "react";
import { Link } from "react-router";
import { adultGroup, formatPrice, requestActionFor, romanticDinner, servicePages, studioRules, type RequestFormat } from "../../data/business";
import { homeImages } from "../../data/home";
import type { MenuType } from "../../data/menu";
import { adultsBreadcrumb } from "../navigation/Breadcrumbs";
import { ButtonLink } from "../ui/Button";
import { FAQSection } from "./FAQSection";
import { ImageTextSection } from "./ImageTextSection";
import { PageHero } from "./PageHero";
import { PageSection } from "./PageSection";

type ServiceHeroProps = Omit<ComponentProps<typeof PageHero>, "title" | "description" | "breadcrumbs">;

export function ServiceHero({ page, action = requestActionFor(page), ...props }: ServiceHeroProps & { page: RequestFormat }) {
  const { title, description, crumb } = servicePages[page];
  const home = { label: "Главная", to: "/" };
  const breadcrumbs = ["corporate", "birthday", "romantic"].includes(page)
    ? [home, adultsBreadcrumb, { label: crumb }] : [home, { label: crumb }];
  return <PageHero title={title} description={description} action={action} breadcrumbs={breadcrumbs} {...props} />;
}

export function EventFacts({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <dl className="event-facts">
      {items.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  );
}

export function AdultGroupFacts() {
  return <EventFacts items={[
    ["Стоимость", formatPrice(adultGroup.price)],
    ["Группа", `От ${adultGroup.minimum} человек`],
    ["Продолжительность", adultGroup.duration],
  ]} />;
}

const formats = ["corporate", "birthday", "romantic"] as const;

export function RelatedFormats({ except }: { except?: typeof formats[number] }) {
  return (
    <PageSection title={except ? "Другие поводы собраться" : "Выберите повод"} tone="alternate">
      <ul className="format-index" role="list">
        {formats.filter((key) => key !== except).map((key) => {
          const { crumb, description, path } = servicePages[key];
          return (
            <li key={key}>
              <h3 className="type-h3"><ButtonLink to={path} variant="text">{crumb} <span aria-hidden="true">↗</span></ButtonLink></h3>
              <p>{description}</p>
            </li>
          );
        })}
      </ul>
    </PageSection>
  );
}

export function MenuTeaser({ type = "adults" }: { type?: MenuType }) {
  const kids = type === "kids";
  return (
    <ImageTextSection
      title={kids ? "Горячее и два блюда на выбор" : "Что приготовим"}
      image={kids ? homeImages.birthday : homeImages.pasta}
      imageSide={kids ? "left" : "right"}
      className={kids ? "kids-menu-preview" : undefined}
    >
      <p>{kids ? "В детском меню есть горячие блюда, салаты, десерты и напитки." : "Посмотрите варианты салатов, горячего и десертов в четырёх взрослых меню."}</p>
      <ButtonLink to={kids ? "/menu/?type=kids#menu-download" : "/menu/#menu-download"} variant="outline">
        {kids ? "Детское меню" : "Смотреть меню"}
      </ButtonLink>
    </ImageTextSection>
  );
}

export const romanticDinnerQuestions = [
  { id: "dinner-guests", question: "На сколько гостей рассчитан романтический ужин?", answer: <p>{romanticDinner.guests}.</p> },
  { id: "dinner-menu", question: "Что будем готовить на романтическом ужине?", answer: <p>Формат включает три блюда. Конкретное меню ужина можно <Link className="underline" to="/contact/">уточнить у студии</Link>.</p> },
];

export function BookingFAQ({ kids = false, includeRomanticDinner = false }: { kids?: boolean; includeRomanticDinner?: boolean }) {
  const items = [
    { id: "booking", question: "Как подтвердить бронирование?", answer: <p>{studioRules.booking}</p> },
    { id: "count", question: "До какого срока можно изменить число гостей?", answer: <p>{studioRules.guestCount}</p> },
    { id: "food", question: "Можно ли принести еду и напитки?", answer: <p>{studioRules.food}</p> },
  ];
  if (kids) items.push({ id: "parents", question: "Кто отвечает за детей?", answer: <p>{studioRules.parents}</p> });
  if (includeRomanticDinner) items.push(...romanticDinnerQuestions);
  return <FAQSection title={kids ? "Вопросы родителей" : "Перед бронированием"} items={items} />;
}
