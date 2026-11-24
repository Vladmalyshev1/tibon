import { adultGroup, formatPrice, requestActionFor, servicePages } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { BookingFAQ, EventFacts, RelatedFormats, ServiceHero } from "../components/pages/ServiceContent";
import { ImageTextSection } from "../components/pages/ImageTextSection";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.birthday);

export default function Birthday() {
  return (
    <main id="main-content" className="service-page cinematic-page" tabIndex={-1}>
      <ServiceHero page="birthday" image={homeImages.birthday} className="birthday-hero"
        details={<EventFacts items={[["Стоимость", formatPrice(adultGroup.price)]]} />}
      />
      <ImageTextSection title="Программа праздника" className="birthday-menu" imageSide="right"
        image={{ ...homeImages.pasta, src: "/images/home/pasta-cinematic.webp" }}>
        <ol className="birthday-program">
          <li>
            <h3 className="type-h3">Выберите меню</h3>
            <p>Посмотрите варианты салатов, горячего и десертов в четырёх взрослых меню.</p>
          </li>
          <li>
            <h3 className="type-h3">Приготовьте блюда с шефом</h3>
            <p>На мастер-классе вы приготовите выбранные блюда вместе с близкими.</p>
          </li>
        </ol>
        <ButtonLink to="/menu/#menu-download" variant="outline">Смотреть меню</ButtonLink>
      </ImageTextSection>
      <PageSection title="Как считается стоимость" tone="alternate" className="editorial-section">
        <div className="editorial-copy">
          <p>Умножьте цену выбранного меню на число гостей. Фотосъёмка, ведущий и игры перечислены отдельно в дополнительных услугах.</p>
          <ButtonLink to="/dop-uslugi/" variant="outline">Дополнительные услуги</ButtonLink>
        </div>
      </PageSection>
      <BookingFAQ />
      <RelatedFormats except="birthday" />
      <PageCTA title="Обсудить день рождения" action={requestActionFor("birthday")} />
    </main>
  );
}
