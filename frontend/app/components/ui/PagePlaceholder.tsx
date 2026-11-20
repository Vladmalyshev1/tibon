import type { BreadcrumbItem } from "../navigation/Breadcrumbs";
import { PageHero } from "../pages/PageHero";

export function PagePlaceholder({ title, parent }: { title: string; parent?: BreadcrumbItem }) {
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Главная", to: "/" }];
  if (parent) breadcrumbs.push(parent);
  breadcrumbs.push({ label: title });

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero
        title={title}
        description="Структурная заготовка страницы. Контент будет добавлен на следующем этапе."
        breadcrumbs={breadcrumbs}
      />
    </main>
  );
}
