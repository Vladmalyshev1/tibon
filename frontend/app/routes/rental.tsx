import { formatPrice, rentalRates, rentalUses, requestAction, servicePages, studioContact } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { ServiceHero } from "../components/pages/ServiceContent";
import { FeatureGrid } from "../components/pages/FeatureGrid";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.rental);

export default function Rental() {
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="rental" image={homeImages.studio} imageCaption="Иллюстрация кухонного пространства" className="rental-hero" />
      <PageSection title="Почасовая аренда" tone="alternate" className="editorial-section">
        <div className="editorial-copy">
          <dl className="editorial-ledger">
            {rentalRates.map(({ id, label, price }) => <div key={id}><dt>{label}</dt><dd>{formatPrice(price)}</dd></div>)}
          </dl>
          <p>Окончательный тариф зависит от выбранного времени. Уточните его при согласовании даты.</p>
        </div>
      </PageSection>
      <PageSection title="Для чего можно снять студию">
        <FeatureGrid items={rentalUses} />
      </PageSection>
      <PageSection title="Как нас найти" className="editorial-section">
        <address className="editorial-copy"><p>{studioContact.address}</p><p>{studioContact.hours}</p></address>
      </PageSection>
      <PageCTA title="Проверить дату и время" action={requestAction} layout="inline" />
    </main>
  );
}