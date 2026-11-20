import { Link } from "react-router";

export type BreadcrumbItem = { label: string; to?: string };

type BreadcrumbsProps = { items: readonly BreadcrumbItem[] };

export const adultsBreadcrumb = { label: "Для взрослых", to: "/dlya-vzroslyh/" } satisfies BreadcrumbItem;

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Навигационная цепочка">
      <ol role="list">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.to && !current
                ? <Link to={item.to}>{item.label}</Link>
                : <span aria-current={current ? "page" : undefined}>{item.label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
