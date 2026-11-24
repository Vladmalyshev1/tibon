import type { MouseEventHandler, ReactNode } from "react";
import { Link, matchPath, useLocation } from "react-router";

export type NavigationItem = { label: string; to: string; section?: boolean; alias?: string };

export function NavigationLink({ item, children, onClick }: {
  item: NavigationItem;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const { pathname } = useLocation();
  const currentPage = matchPath(item.to, pathname) || (item.alias && matchPath(item.alias, pathname));
  const currentSection = item.section && matchPath({ path: item.to, end: false }, pathname);
  const current = currentPage ? "page" : currentSection ? "location" : undefined;
  return <Link to={item.to} aria-current={current} onClick={onClick}>{children}</Link>;
}

export function DesktopNavigation({ items }: { items: readonly NavigationItem[] }) {
  return (
    <nav className="desktop-navigation" aria-label="Основная навигация">
      <ul className="desktop-navigation-list">
        {items.map(item => (
          <li key={item.to}><NavigationLink item={item}><span>{item.label}</span></NavigationLink></li>
        ))}
      </ul>
    </nav>
  );
}
