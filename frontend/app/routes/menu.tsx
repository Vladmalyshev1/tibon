import { Link } from "react-router";
import type { Route } from "./+types/menu";
import { formatPrice, requestAction, servicePages } from "../data/business";
import { adultMenu, kidsMenu, menuDocuments, menuExtras, type MenuType } from "../data/menu";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { Accordion } from "../components/ui/Accordion";
import { ServiceHero } from "../components/pages/ServiceContent";
import { PageCTA } from "../components/pages/PageCTA";
import { PageSection } from "../components/pages/PageSection";

export function loader({ request }: Route.LoaderArgs): { origin: string | null; type: MenuType } {
  const type = new URL(request.url).searchParams.get("type") === "kids" ? "kids" : "adults";
  return { ...loadPublicPage(), type };
}

export const meta = serviceMeta(servicePages.menu);

export default function Menu({ loaderData: { type } }: Route.ComponentProps) {
  const isKids = type === "kids";
  const sets = isKids ? [kidsMenu] : adultMenu;
  const document = menuDocuments[type];
  return (
    <main id="main-content" className="service-page" tabIndex={-1}>
      <ServiceHero page="menu" className="menu-hero" />
      <PageSection id="menu-options" title={document.title} tone="alternate" className="menu-section">
        <nav className="menu-types" aria-label="Тип меню">
          <Link to="/menu/#menu-options" aria-current={!isKids ? "page" : undefined}>Взрослое</Link>
          <Link to="/menu/?type=kids#menu-options" aria-current={isKids ? "page" : undefined}>Детское</Link>
        </nav>
        <div className="menu-sets">
          {sets.map((set, index) => (
            <Accordion key={set.id} title={`${set.title} · ${formatPrice({ amount: set.amount, unit: "человек" })}`} defaultOpen={index === 0}>
              {isKids ? <p>К горячему блюду выберите ещё два блюда из меню.</p> : null}
              <div className="menu-categories">
                {set.categories.map(({ title, dishes }) => (
                  <section key={title}>
                    <h3 className="type-h3">{title}</h3>
                    <ul>{dishes.map(dish => <li key={dish}>{dish}</li>)}</ul>
                  </section>
                ))}
              </div>
            </Accordion>
          ))}
        </div>
        <a className="button-outline button-md" href={document.url}>Открыть PDF · {document.size}</a>
      </PageSection>
      {!isKids ? (
        <PageSection title="Стейки, закуски и напитки" className="editorial-section">
          <div className="menu-sets">
            {menuExtras.map(({ id, title, note, dishes }) => (
              <Accordion key={id} title={title}>
                {note ? <p>{note}</p> : null}
                <dl className="menu-price-list">
                  {dishes.map(([dish, amount, quantity, from]) => (
                    <div key={dish}>
                      <dt>{dish}{quantity ? <small>{quantity}</small> : null}</dt>
                      <dd>{formatPrice({ amount, from })}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
            ))}
          </div>
        </PageSection>
      ) : null}
      <PageCTA title="Обсудить меню для вашей компании" description="Сообщите число гостей и предпочтения при обращении в студию." action={requestAction} layout="inline" />
    </main>
  );
}
