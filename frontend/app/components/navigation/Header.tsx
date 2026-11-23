import { useCallback, useState } from "react";
import { Link } from "react-router";
import { DesktopNavigation, type NavigationItem } from "./DesktopNavigation";
import { MobileMenu } from "./MobileMenu";
import { BrandMark } from "../ui/BrandMark";
import { LineIcon } from "../ui/LineIcon";
import { studioContact } from "../../data/business";

const navigationItems: readonly NavigationItem[] = [
  { label: "Для взрослых", to: "/dlya-vzroslyh/", section: true },
  { label: "Для детей", to: "/dlya-detey/" },
  { label: "Аренда студии", to: "/arenda/" },
  { label: "Меню", to: "/menu/" },
  { label: "Доп. услуги", to: "/dop-uslugi/" },
  { label: "Контакты", to: "/contact/", alias: "/kontakty/" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <a className="skip-link" href="#main-content">К содержанию</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-mark" to="/" aria-label="TIBON — главная"><BrandMark /></Link>
          <DesktopNavigation items={navigationItems} />
          <a className="header-phone" href={studioContact.phone.href}>
            <LineIcon name="phone" />
            <span>{studioContact.phone.label}</span>
          </a>
          <button
            id="mobile-menu-trigger"
            className="menu-trigger icon-button"
            type="button"
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "mobile-navigation-dialog" : undefined}
            onClick={() => setMenuOpen(true)}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </header>
      {menuOpen ? <MobileMenu items={navigationItems} onClose={closeMenu} /> : null}
    </>
  );
}
