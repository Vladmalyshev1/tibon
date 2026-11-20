import { informationPages, studioContact } from "../data/business";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { PageHero } from "../components/pages/PageHero";
import { PageSection } from "../components/pages/PageSection";

export const loader = loadPublicPage;
export const meta = serviceMeta(informationPages.contact);

export default function Contact() {
  return (
    <main id="main-content" className="information-page" tabIndex={-1}>
      <PageHero className="information-hero contact-hero" title="Контакты" breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Контакты" }]} />
      <PageSection title="Как добраться" className="contact-section">
        <div className="contact-layout">
          <address className="contact-details">
            <a className="contact-phone" href={studioContact.phone.href}>{studioContact.phone.label}</a>
            <p>{studioContact.address}</p>
            <p>{studioContact.hours}</p>
            <ul className="official-links" role="list">
              {studioContact.socials.map(({ label, href, icon }) => (
                <li key={href}>
                  <a href={href}>
                    {icon ? <img src={icon} width={18} height={18} alt="" /> : null}
                    {label} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <a className="button-outline button-md" href={studioContact.mapUrl}>Открыть в Яндекс Картах</a>
          </address>
          <iframe
            className="studio-map"
            title="Карта проезда к кулинарной студии TIBON"
            src={studioContact.mapEmbedUrl}
            referrerPolicy="no-referrer"
          />
        </div>
      </PageSection>
    </main>
  );
}
