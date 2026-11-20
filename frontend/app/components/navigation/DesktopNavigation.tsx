import { NavLink } from "react-router";
import type { BreadcrumbItem } from "./Breadcrumbs";

export type NavigationItem = BreadcrumbItem & { to: string };

type DesktopNavigationProps = { items: NavigationItem[] };

export function DesktopNavigation({ items }: DesktopNavigationProps) {
  return (
    <nav className="desktop-navigation" aria-label="Основная навигация">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === "/"}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
