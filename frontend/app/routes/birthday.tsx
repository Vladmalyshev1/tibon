import { adultGroup, formatPrice, requestAction, servicePages } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { BookingFAQ, EventFacts, MenuTeaser, RelatedFormats, ServiceHero } from "../components/pages/ServiceContent";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.birthday);

export default function Birthday() {
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="birthday" image={homeImages.birthday} className="birthday-hero"
        details={<EventFacts items={[["Стоимость", formatPrice(adultGroup.price)]]} />}
      />
      <MenuTeaser />
      <PageSection title="Как считается стоимость" tone="alternate" className="editorial-section">
        <div className="editorial-copy">
          <p>Умножьте цену выбранного меню на число гостей. Фотосъёмка, ведущий и игры перечислены отдельно в дополнительных услугах.</p>
          <ButtonLink to="/dop-uslugi/" variant="outline">Дополнительные услуги</ButtonLink>
        </div>
      </PageSection>
      <BookingFAQ />
      <RelatedFormats except="birthday" />
      <PageCTA title="Обсудить день рождения" action={requestAction} />
    </main>
  );
}