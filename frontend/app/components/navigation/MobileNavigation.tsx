import { NavigationLink, type NavigationItem } from "./DesktopNavigation";

type MobileNavigationProps = { items: readonly NavigationItem[]; onNavigate: () => void };

export function MobileNavigation({ items, onNavigate }: MobileNavigationProps) {
  return (
    <nav aria-label="Основная мобильная навигация">
      <ul className="mobile-menu-links">
        {items.map((item) => (
          <li key={item.to}>
            <NavigationLink item={item} onClick={onNavigate}>
              {item.label} <span aria-hidden="true">↗</span>
            </NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
