import { formatPrice, requestAction, romanticDinner, servicePages } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { EventFacts, RelatedFormats, ServiceHero } from "../components/pages/ServiceContent";
import { FAQSection } from "../components/pages/FAQSection";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.romantic);

export default function RomanticDinner() {
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="romantic" image={{ ...homeImages.dinner, focalPoint: "50% 54%" }} className="romantic-hero"
        details={<EventFacts items={[["Стоимость ужина", formatPrice(romanticDinner.price)]]} />}
      />
      <PageSection title="Ужин в вашем темпе" tone="alternate" className="editorial-section">
        <dl className="editorial-ledger">
          <div><dt>В студии</dt><dd>{romanticDinner.rentalDuration} аренды</dd></div>
          <div><dt>За столом</dt><dd>{romanticDinner.courses} и мастер-класс</dd></div>
          <div><dt>В программе</dt><dd>{romanticDinner.show}</dd></div>
        </dl>
      </PageSection>
      <FAQSection title="О формате" items={[
        { id: "guests", question: "Сколько гостей рассчитано на этот формат?", answer: <p>{romanticDinner.guests}.</p> },
        { id: "food", question: "Что будем готовить?", answer: <p>Формат включает три блюда. Конкретное меню ужина уточните при обращении в студию.</p> },
      ]} />
      <RelatedFormats except="romantic" />
      <PageCTA title="Подобрать дату ужина" action={requestAction} layout="inline" />
    </main>
  );
}