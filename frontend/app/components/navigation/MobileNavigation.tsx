import { NavLink } from "react-router";
import type { NavigationItem } from "./DesktopNavigation";

type MobileNavigationProps = { items: NavigationItem[]; onNavigate: () => void };

export function MobileNavigation({ items, onNavigate }: MobileNavigationProps) {
  return (
    <nav aria-label="Основная мобильная навигация">
      <ul className="mobile-menu-links">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} onClick={onNavigate}>
              {item.label} <span aria-hidden="true">↗</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
