import { adultGroup, requestAction, servicePages } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { AdultGroupFacts, BookingFAQ, RelatedFormats, ServiceHero } from "../components/pages/ServiceContent";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.corporate);

export default function Corporate() {
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="corporate" image={homeImages.corporate} layout="stacked" className="corporate-hero" />
      <PageSection title="Как проходит корпоратив" tone="alternate" className="editorial-section">
        <div className="editorial-copy">
          <AdultGroupFacts />
          <p>Команда готовит с шефом. Кулинарная часть занимает {adultGroup.cooking}, затем участники пробуют приготовленное.</p>
          <div className="editorial-links">
            <ButtonLink to="/menu/" variant="outline">Выбрать меню</ButtonLink>
            <ButtonLink to="/dop-uslugi/" variant="text">Игры и ведущий <span aria-hidden="true">↗</span></ButtonLink>
          </div>
        </div>
      </PageSection>
      <BookingFAQ />
      <RelatedFormats except="corporate" />
      <PageCTA title="Обсудить корпоратив" description="Подготовьте дату встречи и размер команды." action={requestAction} layout="inline" />
    </main>
  );
}