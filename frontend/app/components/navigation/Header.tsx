import { useEffect, useState } from "react";
import { Link } from "react-router";
import { DesktopNavigation, type NavigationItem } from "./DesktopNavigation";
import { MobileMenu } from "./MobileMenu";
import { ButtonLink } from "../ui/Button";
import { requestAction, studioContact } from "../../data/business";

const navigationItems: NavigationItem[] = [
  { label: "Главная", to: "/" },
  { label: "Для взрослых", to: "/dlya-vzroslyh/" },
  { label: "Для детей", to: "/dlya-detey/" },
  { label: "Аренда", to: "/arenda/" },
  { label: "Меню", to: "/menu/" },
  { label: "Услуги", to: "/dop-uslugi/" },
  { label: "Галерея", to: "/galereya/" },
  { label: "Контакты", to: "/contact/" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 80);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">К содержанию</a>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="header-inner container-default">
          <Link className="wordmark" to="/" aria-label="TIBON — главная">TIBON</Link>
          <DesktopNavigation items={navigationItems} />
          <a className="header-phone" href={studioContact.phone.href}>{studioContact.phone.label}</a>
          <ButtonLink className="header-cta" to={requestAction.to} size="sm">{requestAction.label}</ButtonLink>
          <button
            id="mobile-menu-trigger"
            className="menu-trigger icon-button"
            type="button"
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation-dialog"
            onClick={() => setMenuOpen(true)}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </header>
      {menuOpen ? <MobileMenu items={navigationItems} onClose={() => setMenuOpen(false)} /> : null}
    </>
  );
}
