import { PageHero } from "../components/pages/PageHero";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";
import { founderImage, homeHeading } from "../data/home";
import { studioContact } from "../data/business";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("О студии"); }
export default function Studio() {
  return (
    <main id="main-content" className="cinematic-page studio-page" tabIndex={-1}>
      <PageHero title={homeHeading} className="studio-hero" image={founderImage}
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "О студии" }]}
        description="На мастер-классах гости готовят вместе с шефом. Он показывает приёмы, помогает с блюдами, а за ужином можно попробовать всё, что приготовили."
        action={{ to: "/#directions", label: "Выбрать программу" }}
      />
      <PageSection title="Где находится студия" className="editorial-section" tone="alternate">
        <address className="editorial-copy">
          <p>{studioContact.address}</p>
          <p>{studioContact.hours}</p>
          <ButtonLink to="/contact/" variant="outline">Как добраться</ButtonLink>
        </address>
      </PageSection>
    </main>
  );
}
