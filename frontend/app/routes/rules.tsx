import { informationPages, studioContact, studioRules } from "../data/business";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { PageHero } from "../components/pages/PageHero";

export const loader = loadPublicPage;
export const meta = serviceMeta(informationPages.rules);

const sections = [
  { id: "visit", title: "Посещение студии", rules: [studioRules.belongings, studioRules.smoking, studioRules.breakage, studioRules.food] },
  { id: "children", title: "Участие детей", rules: [studioRules.parents, studioRules.participation] },
  { id: "booking", title: "Бронирование и перенос", rules: [studioRules.booking, studioRules.guestCount, studioRules.cancellation, studioRules.rescheduling] },
];

export default function Rules() {
  return (
    <main id="main-content" className="information-page" tabIndex={-1}>
      <PageHero className="information-hero" title="Правила студии"
        description="О чём стоит знать до того, как согласовать дату и внести предоплату."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Правила студии" }]}
      />
      <div className="container-default rules-layout">
        <nav aria-label="Разделы правил" className="rules-nav">
          <ul role="list">
            {sections.map(({ id, title }) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}
          </ul>
        </nav>
        <div className="rules-copy">
          {sections.map(({ id, title, rules }) => (
            <section id={id} key={id} aria-labelledby={`${id}-title`}>
              <h2 id={`${id}-title`} className="type-h2">{title}</h2>
              <ul>{rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
            </section>
          ))}
          <p>Условия отмены в другие сроки и вопросы о посещении можно уточнить по телефону <a href={studioContact.phone.href}>{studioContact.phone.label}</a>.</p>
        </div>
      </div>
    </main>
  );
}