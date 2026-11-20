import type { ComponentProps } from "react";
import { adultGroup, formatPrice, requestAction, servicePages, studioRules } from "../../data/business";
import { homeImages } from "../../data/home";
import type { MenuType } from "../../data/menu";
import { adultsBreadcrumb } from "../navigation/Breadcrumbs";
import { ButtonLink } from "../ui/Button";
import { FAQSection } from "./FAQSection";
import { ImageTextSection } from "./ImageTextSection";
import { PageHero } from "./PageHero";
import { PageSection } from "./PageSection";

type PageKey = keyof typeof servicePages;
type ServiceHeroProps = Omit<ComponentProps<typeof PageHero>, "title" | "description" | "action" | "breadcrumbs">;

export function ServiceHero({ page, ...props }: ServiceHeroProps & { page: PageKey }) {
  const { title, description, crumb } = servicePages[page];
  const home = { label: "Главная", to: "/" };
  const breadcrumbs = ["corporate", "birthday", "romantic"].includes(page)
    ? [home, adultsBreadcrumb, { label: crumb }] : [home, { label: crumb }];
  return <PageHero title={title} description={description} action={requestAction} breadcrumbs={breadcrumbs} {...props} />;
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
    >
      <p>{kids ? "В детском меню есть горячие блюда, салаты, десерты и напитки." : "Посмотрите варианты салатов, горячего и десертов в четырёх взрослых меню."}</p>
      <ButtonLink to={kids ? "/menu/?type=kids#menu-options" : "/menu/#menu-options"} variant="outline">
        {kids ? "Детское меню" : "Смотреть меню"}
      </ButtonLink>
    </ImageTextSection>
  );
}

export function BookingFAQ({ kids = false }: { kids?: boolean }) {
  const items = [
    { id: "booking", question: "Как подтвердить бронирование?", answer: <p>{studioRules.booking}</p> },
    { id: "count", question: "До какого срока можно изменить число гостей?", answer: <p>{studioRules.guestCount}</p> },
    { id: "food", question: kids ? "Можно ли принести свой торт?" : "Можно ли принести еду и напитки?", answer: <p>{studioRules.food}</p> },
  ];
  if (kids) items.push({ id: "parents", question: "Кто отвечает за детей?", answer: <p>{studioRules.parents}</p> });
  return <FAQSection title={kids ? "Вопросы родителей" : "Перед бронированием"} items={items} />;
}
