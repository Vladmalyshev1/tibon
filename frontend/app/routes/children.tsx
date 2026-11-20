import { formatPrice, kidsGroup, requestAction, servicePages, studioRules } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { BookingFAQ, EventFacts, MenuTeaser, ServiceHero } from "../components/pages/ServiceContent";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.kids);

export default function Children() {
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="kids" image={{ ...homeImages.baking, focalPoint: "50% 77%" }} className="kids-hero" />
      <PageSection title="Праздник с мастер-классом" tone="alternate" className="editorial-section">
        <div className="editorial-copy">
          <EventFacts items={[
            ["Стоимость", formatPrice(kidsGroup.price)],
            ["Участники", `От ${kidsGroup.minimum} детей`],
            ["Праздник", kidsGroup.duration],
          ]} />
          <p>На приготовление отводится {kidsGroup.cooking}. {studioRules.parents}</p>
          <ButtonLink to="/dop-uslugi/#animation" variant="text">Детские аниматоры <span aria-hidden="true">↗</span></ButtonLink>
        </div>
      </PageSection>
      <MenuTeaser type="kids" />
      <BookingFAQ kids />
      <PageCTA title="Подобрать дату для праздника" action={requestAction} />
    </main>
  );
}