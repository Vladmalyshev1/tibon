import type { ReactNode } from "react";
import { Link, useMatch } from "react-router";
import type { BreadcrumbItem } from "./Breadcrumbs";

export type NavigationItem = BreadcrumbItem & { to: string };

type DesktopNavigationProps = { items: NavigationItem[] };

export function NavigationLink({ to, children, onClick }: { to: string; children: ReactNode; onClick?: () => void }) {
  const active = useMatch({ path: to, end: to === "/" });
  return <Link to={to} aria-current={active ? "page" : undefined} onClick={onClick}>{children}</Link>;
}

export function DesktopNavigation({ items }: DesktopNavigationProps) {
  return (
    <nav className="desktop-navigation" aria-label="Основная навигация">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavigationLink to={item.to}>{item.label}</NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
