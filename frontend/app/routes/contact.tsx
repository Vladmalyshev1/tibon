import { informationPages, studioContact } from "../data/business";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { Breadcrumbs } from "../components/navigation/Breadcrumbs";
import { LineIcon } from "../components/ui/LineIcon";

export const loader = loadPublicPage;
export const meta = serviceMeta(informationPages.contact);
const [hoursPrefix, hoursRange, hoursSuffix] = studioContact.hours.split(/(\d{2}:\d{2}–\d{2}:\d{2})/);

export default function Contact() {
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
                <dd><a className="reference-contact-phone" href={studioContact.phone.href}>{studioContact.phone.label}</a></dd>
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
                  <a href={href}>
                    {icon ? <img src={icon} width={36} height={36} alt="" /> : <LineIcon name={label === "Telegram" ? "telegram" : "vk"} />}
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
            <a className="button-primary button-lg" href={studioContact.mapUrl}>Открыть в Яндекс Картах <LineIcon name="arrow" /></a>
          </address>
          <iframe className="reference-map" title="Карта проезда к кулинарной студии TIBON"
            src={studioContact.mapEmbedUrl} referrerPolicy="no-referrer" />
        </div>
      </section>
    </main>
  );
}
