import type { ReactNode } from "react";
import { PageHero } from "../pages/PageHero";

export function PagePlaceholder({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main id="main-content" className="information-page cinematic-page publication-page" tabIndex={-1}>
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: title }]}
        details={children}
      />
    </main>
  );
}
