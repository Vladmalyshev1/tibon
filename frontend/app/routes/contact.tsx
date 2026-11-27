import { informationPages, studioContact } from "../data/business";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { Breadcrumbs } from "../components/navigation/Breadcrumbs";
import { LineIcon } from "../components/ui/LineIcon";
import { StudioPhones } from "../components/ui/StudioPhones";
import { useCookieConsent } from "../lib/cookieConsent";
import type { Route } from "./+types/contact";

export const loader = loadPublicPage;
const contactMeta = serviceMeta(informationPages.contact);

export function meta({ data }: Route.MetaArgs) {
  const tags = contactMeta({ data });
  if (!data?.origin) return tags;
  return [...tags, {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": new URL("/#localbusiness", data.origin).href,
      url: new URL("/", data.origin).href,
      name: "TIBON",
      description: `Кулинарная студия. ${studioContact.hours}.`,
      telephone: studioContact.phones.map(({ href }) => href.slice(4)),
      address: { "@type": "PostalAddress", ...studioContact.postalAddress },
    },
  }];
}
const [hoursPrefix, hoursRange, hoursSuffix] = studioContact.hours.split(/(\d{2}:\d{2}–\d{2}:\d{2})/);

export default function Contact() {
  const consent = useCookieConsent();

  return (
    <main id="main-content" className="information-page cinematic-page contact-page" tabIndex={-1}>
      <section className="hero reference-contact" aria-labelledby="contact-title">
        <div className="reference-breadcrumb">
          <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Контакты" }]} />
        </div>
        <div className="hero-container reference-contact-layout">
          <div className="reference-contact-heading">
            <p className="cinematic-kicker">Контакты</p>
            <h1 id="contact-title" className="type-display">Как добраться</h1>
          </div>
          <address className="reference-contact-details">
            <dl className="reference-contact-facts">
              <div>
                <dt><LineIcon name="phone" />Телефон</dt>
                <dd><StudioPhones linkClassName="reference-contact-phone" showIcons={false} /></dd>
              </div>
              <div>
                <dt><LineIcon name="pin" />Адрес</dt>
                <dd>{studioContact.address}</dd>
              </div>
              <div>
                <dt><LineIcon name="clock" />Часы работы</dt>
                <dd>{hoursPrefix}<strong>{hoursRange}</strong>{hoursSuffix}</dd>
              </div>
            </dl>
            <ul className="reference-socials" role="list">
              {studioContact.socials.map(({ label, href, icon }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={`${label} (откроется в новой вкладке)`}>
                    {icon ? <img src={icon} width={36} height={36} alt="" /> : <LineIcon name="vk" />}
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href="https://www.instagram.com/ti_bon_studio?jplx=YjQxOW9qcXlsNjBv"
                  aria-label="Instagram TIBON (откроется в новой вкладке)" target="_blank" rel="noopener noreferrer">
                  <LineIcon name="instagram" />
                  Instagram
                </a>
              </li>
            </ul>
            <a className="button-primary button-lg" href={studioContact.mapUrl}
              target="_blank" rel="noopener noreferrer"
              aria-label="Открыть в Яндекс Картах (откроется в новой вкладке)">
              Открыть в Яндекс Картах <LineIcon name="arrow" />
            </a>
          </address>
          {consent === "accepted" ? (
            <iframe className="reference-map" title="Карта проезда к кулинарной студии TIBON"
              src={studioContact.mapEmbedUrl} referrerPolicy="no-referrer" />
          ) : (
            <div className="reference-map reference-map-placeholder">
              Интерактивная карта доступна после принятия дополнительных cookie.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
