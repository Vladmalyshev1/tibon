import { Link } from "react-router";
import { studioOperator } from "../../data/business";
import { Container } from "../ui/Container";
import { BrandMark } from "../ui/BrandMark";

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
    phone?: { label: string; href: string };
    email?: string;
    address?: string;
    hours?: string;
  };
  socials?: { label: string; href: string }[];
};

export function Footer({ contact, socials = [] }: FooterProps) {
  return (
    <footer className="site-footer">
      <Container className="footer-inner">
        <div className="footer-brand">
          <Link className="brand-mark" to="/" aria-label="TIBON — главная"><BrandMark /></Link>
        </div>
        <nav className="footer-main-navigation" aria-label="Навигация в подвале">
          <ul className="footer-links">
            {footerLinks.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}
          </ul>
        </nav>
        {contact || socials.length > 0 ? (
          <div className="footer-info">
            {contact ? (
              <address className="footer-contact">
                {contact.phone ? <a href={contact.phone.href}>{contact.phone.label}</a> : null}
                {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null}
                {contact.address ? <span>{contact.address}</span> : null}
                {contact.hours ? <span>{contact.hours}</span> : null}
              </address>
            ) : null}
            {socials.length > 0 ? (
              <nav className="footer-socials" aria-label="Социальные сети">
                {socials.map((social) => <a key={social.href} href={social.href} rel="noopener noreferrer">{social.label}</a>)}
              </nav>
            ) : null}
          </div>
        ) : null}
        <div className="footer-meta">
          <nav className="footer-legal" aria-label="Правовая информация">
            <Link to="/politika-konfidencialnosti/">Политика обработки персональных данных</Link>
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
