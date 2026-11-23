import { formatPrice, kidsGroup, requestAction, servicePages } from "../data/business";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { BookingFAQ, EventFacts, MenuTeaser } from "../components/pages/ServiceContent";
import { ReferenceHero } from "../components/pages/ReferenceHero";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.kids);

const kidsIllustration = {
  src: "/images/studio/kids-pizza-1100.webp",
  srcSet: "/images/studio/kids-pizza-640.webp 640w, /images/studio/kids-pizza-1100.webp 1100w",
  sizes: "(min-width: 48rem) 65vw, 100vw",
  width: 1100,
  height: 614,
  alt: "Иллюстрация детского мастер-класса по приготовлению пиццы",
};

export default function Children() {
  return (
    <main id="main-content" className="service-page cinematic-page" tabIndex={-1}>
      <ReferenceHero page="kids" lines={["Детские", "кулинарные", "мастер-классы"]} image={kidsIllustration} />
      <PageSection title="Праздник с мастер-классом" tone="alternate" className="kids-program">
        <div className="editorial-copy">
          <EventFacts items={[
            ["Стоимость", formatPrice(kidsGroup.price)],
            ["Участники", `От ${kidsGroup.minimum} детей`],
            ["Праздник", kidsGroup.duration],
          ]} />
          <p>На приготовление отводится {kidsGroup.cooking}.</p>
          <ButtonLink to="/dop-uslugi/#animation" variant="text">Детские аниматоры <span aria-hidden="true">↗</span></ButtonLink>
        </div>
      </PageSection>
      <MenuTeaser type="kids" />
      <BookingFAQ kids />
      <PageCTA title="Подобрать дату для праздника" action={requestAction} />
    </main>
  );
}
