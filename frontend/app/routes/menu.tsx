import { Link } from "react-router";
import type { Route } from "./+types/menu";
import { servicePages } from "../data/business";
import type { MenuType } from "../data/menu";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { LineIcon } from "../components/ui/LineIcon";
import { MenuDownloadForm } from "../components/pages/MenuDownloadForm";

export function loader({ request }: Route.LoaderArgs): { origin: string | null; type: MenuType } {
  const type = new URL(request.url).searchParams.get("type") === "kids" ? "kids" : "adults";
  return { ...loadPublicPage(), type };
}

export const meta = serviceMeta(servicePages.menu);

export const links: Route.LinksFunction = () => [
  { rel: "preload", as: "image", href: "/images/studio/menu-cover-mobile.webp", media: "(width < 64rem)", type: "image/webp", fetchPriority: "high" },
  { rel: "preload", as: "image", href: "/images/studio/menu-cover.webp", media: "(width >= 64rem)", type: "image/webp", fetchPriority: "high" },
];

export default function Menu({ loaderData: { type } }: Route.ComponentProps) {
  return (
    <main id="main-content" className="service-page cinematic-menu" tabIndex={-1}>
      <section className="hero menu-hero" aria-labelledby="menu-title">
        <div className="hero-container menu-hero-inner">
          <div className="menu-hero-copy">
            <p className="cinematic-kicker">Меню студии</p>
            <h1 id="menu-title" className="type-display">Ознакомьтесь<br />{" "}с нашим меню</h1>
            <p className="type-lead">Выберите меню для <Link className="underline" to={servicePages.adults.path}>взрослого мастер-класса</Link>
              {" "}или <Link className="underline" to={servicePages.kids.path}>детского праздника</Link>. В обоих вариантах есть салаты, горячее и десерты.</p>
          </div>
          <div className="menu-hero-cover" aria-hidden="true" />
          <section id="menu-download" className="menu-download-panel" aria-labelledby="menu-download-title" tabIndex={-1}>
            <div className="menu-download-heading">
              <LineIcon name="download" />
              <h2 id="menu-download-title">Скачать меню</h2>
            </div>
            <MenuDownloadForm current={type} />
          </section>
        </div>
      </section>
    </main>
  );
}
