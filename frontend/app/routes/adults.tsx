import { adultGroup, requestAction, servicePages } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { AdultGroupFacts, BookingFAQ, MenuTeaser, RelatedFormats, ServiceHero } from "../components/pages/ServiceContent";
import { PageSection } from "../components/pages/PageSection";
import { PageCTA } from "../components/pages/PageCTA";
import { ButtonLink } from "../components/ui/Button";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.adults);

export default function Adults() {
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="adults" image={homeImages.hero} className="adult-hero" details={<AdultGroupFacts />} />
      <RelatedFormats />
      <PageSection title="Два формата вечера" className="editorial-section">
        <div className="editorial-copy">
          <h3 className="type-h3">Мастер-класс</h3>
          <p>Готовите вместе с шефом. На приготовление отводится {adultGroup.cooking}. После него можно попробовать блюда за общим столом.</p>
          <h3 className="type-h3">Ресторанный формат</h3>
          <p>Шеф готовит выбранное меню для вашей компании.</p>
          <ButtonLink to="/dop-uslugi/" variant="text">Дополнительные услуги <span aria-hidden="true">↗</span></ButtonLink>
        </div>
      </PageSection>
      <MenuTeaser />
      <BookingFAQ />
      <PageCTA title="Какой повод планируете?" description="Укажите дату и число гостей при обращении в студию." action={requestAction} layout="inline" />
    </main>
  );
}