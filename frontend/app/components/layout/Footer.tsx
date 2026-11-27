import { Link } from "react-router";
import type { MouseEventHandler } from "react";
import { studioOperator } from "../../data/business";
import { Container } from "../ui/Container";
import { BrandMark } from "../ui/BrandMark";
import { StudioPhones } from "../ui/StudioPhones";

const footerLinks = [
  { label: "Для взрослых", to: "/dlya-vzroslyh/" },
  { label: "Для детей", to: "/dlya-detey/" },
  { label: "Аренда студии", to: "/arenda/" },
  { label: "Меню", to: "/menu/" },
  { label: "Дополнительные услуги", to: "/dop-uslugi/" },
  { label: "Контакты", to: "/contact/" },
];

type FooterProps = {
  contact?: {
    email?: string;
    address?: string;
    hours?: string;
  };
  socials?: { label: string; href: string }[];
  cookieBannerOpen: boolean;
  onCookieSettings?: MouseEventHandler<HTMLButtonElement>;
};

export function Footer({ contact, socials = [], cookieBannerOpen, onCookieSettings }: FooterProps) {
  return (
    <footer className="site-footer">
      <Container className="footer-inner">
        <div className="footer-brand">
          <Link className="brand-mark" to="/" aria-label="TIBON — главная"><BrandMark /></Link>
        </div>
        <nav className="footer-main-navigation" aria-label="Навигация в подвале">
          <ul className="footer-links">
            {footerLinks.map((item) => <li key={item.to}><Link to={item.to}><span>{item.label}</span></Link></li>)}
          </ul>
        </nav>
        {contact || socials.length > 0 ? (
          <div className="footer-info">
            {contact ? (
              <address className="footer-contact">
                <StudioPhones />
                {contact.email ? <a href={`mailto:${contact.email}`}><span>{contact.email}</span></a> : null}
                {contact.address ? <span>{contact.address}</span> : null}
                {contact.hours ? <span>{contact.hours}</span> : null}
              </address>
            ) : null}
            {socials.length > 0 ? (
              <nav className="footer-socials" aria-label="Социальные сети">
                {socials.map((social) => <a key={social.href} href={social.href} rel="noopener noreferrer"><span>{social.label}</span></a>)}
              </nav>
            ) : null}
          </div>
        ) : null}
        <div className="footer-meta">
          <nav className="footer-legal" aria-label="Правовая информация">
            <Link to="/politika-konfidencialnosti/"><span>Политика обработки персональных данных</span></Link>
            <button type="button" className="footer-cookie-settings" onClick={onCookieSettings} disabled={!onCookieSettings}
              aria-expanded={cookieBannerOpen} aria-controls={cookieBannerOpen ? "cookie-consent" : undefined}>
              Настройки cookie
            </button>
          </nav>
          <div className="footer-business">
            <p>© TIBON · {studioOperator.name}</p>
            <p>ОГРНИП: {studioOperator.registrationNumber}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
