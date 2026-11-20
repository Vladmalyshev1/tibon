import { extraServices, formatPrice, requestAction, servicePages } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { ServiceHero } from "../components/pages/ServiceContent";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";
import { ServiceCard } from "../components/pages/ServiceCard";
import { ButtonLink } from "../components/ui/Button";

export const loader = loadPublicPage;
export const meta = serviceMeta(servicePages.extras);

export default function Services() {
  const [host, ...extras] = extraServices;
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="extras" className="extras-hero" />
      <PageSection title="Что можно добавить к мастер-классу" tone="alternate" className="extras-section">
        <div className="extras-layout">
          <ServiceCard title={host.title} description={host.description} image={homeImages.corporate}
            action={{ ...requestAction, label: "Запросить ведущего" }}
          />
          <ul className="extras-list" role="list">
            {extras.map((service) => (
              <li id={service.id} key={service.id}>
                <h3 className="type-h3">{service.title}</h3>
                <p>{service.description}</p>
                <p className="extras-price">{service.price ? formatPrice(service.price) : service.priceNote}</p>
                <ButtonLink to={requestAction.to} variant="text" aria-label={`Запросить: ${service.title}`}>
                  Запросить <span aria-hidden="true">↗</span>
                </ButtonLink>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>
      <PageCTA title="Согласовать услуги для вашего праздника" description="Сообщите дату встречи и какие услуги вас интересуют." action={requestAction} layout="inline" />
    </main>
  );
}