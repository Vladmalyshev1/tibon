import { formatPrice, rentalRates, rentalUses, requestActionFor, servicePages, studioContact } from "../data/business";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { ReferenceHero } from "../components/pages/ReferenceHero";
import { FeatureGrid } from "../components/pages/FeatureGrid";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";
import { LineIcon } from "../components/ui/LineIcon";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.rental);

const rentalHero = {
  src: "/images/studio/rental-hero-1672.webp",
  srcSet: "/images/studio/rental-hero-640.webp 640w, /images/studio/rental-hero-960.webp 960w, /images/studio/rental-hero-1672.webp 1672w",
  avifSrcSet: "/images/studio/rental-hero-640.avif 640w, /images/studio/rental-hero-960.avif 960w, /images/studio/rental-hero-1672.avif 1672w",
  sizes: "(min-width: 48rem) 81vw, 100vw",
  alt: "Иллюстрация кухонного пространства с островом и барными стульями",
  width: 1672,
  height: 941,
};

export default function Rental() {
  return (
    <main id="main-content" className="service-page cinematic-page" tabIndex={-1}>
      <ReferenceHero page="rental" lines={["Аренда", "кулинарной", "студии"]}
        image={rentalHero} />
      <section className="reference-rates" aria-labelledby="rental-rates-title">
        <div className="reference-wrap reference-rates-layout">
          <h2 id="rental-rates-title" className="type-h2 reference-rule">Почасовая аренда</h2>
          <dl className="reference-rate-cards">
            {rentalRates.map(({ id, label, price }) => (
              <div key={id}>
                <dt><LineIcon name={id === "weekday" ? "calendar" : "calendar-star"} />{label}</dt>
                <dd><strong>{formatPrice({ amount: price.amount })}</strong>{" "}<span>в час</span></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <PageSection title="Для чего можно снять студию" className="rental-uses">
        <FeatureGrid items={rentalUses} />
      </PageSection>
      <PageSection title="Как нас найти" className="editorial-section">
        <address className="editorial-copy">
          <p>{studioContact.address}</p><p>{studioContact.hours}</p>
          <ButtonLink to="/contact/" variant="outline">Карта проезда</ButtonLink>
        </address>
      </PageSection>
      <PageCTA title="Проверить дату и время" action={requestActionFor("rental")} layout="inline" />
    </main>
  );
}
