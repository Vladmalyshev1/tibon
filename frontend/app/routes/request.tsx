import { LeadForm } from "../components/pages/LeadForm";
import { ButtonLink } from "../components/ui/Button";
import { LineIcon } from "../components/ui/LineIcon";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { getRequestFormat, studioContact } from "../data/business";
import type { Route } from "./+types/request";

export function loader({ request }: Route.LoaderArgs) {
  const format = getRequestFormat(new URL(request.url).searchParams.get("format"));
  return { ...loadPublicPage(), format };
}
const requestMeta = serviceMeta({
  title: "Оставить заявку",
  description: "Оставьте заявку на мероприятие в TIBON или позвоните в студию, чтобы согласовать дату и формат.",
  path: "/zayavka/",
});

export const meta: typeof requestMeta = args => [
  ...requestMeta(args), { name: "robots", content: "noindex, follow" },
];

export default function Request({ loaderData: { format } }: Route.ComponentProps) {
  return (
    <main id="main-content" className="information-page cinematic-page request-page" tabIndex={-1}>
      <div className="hero-container">
        <div className="request-layout">
          <section className="hero request-intro" aria-labelledby="request-title">
            <h1 id="request-title" className="type-display">Оставить заявку</h1>
            <p className="type-lead">Заполните форму или позвоните в студию, чтобы согласовать дату и формат мероприятия.</p>
            <div className="request-contact">
              <a className="button-outline button-md" href={studioContact.phone.href}><LineIcon name="phone" /> Позвонить · {studioContact.phone.label}</a>
              <p>{studioContact.hours}</p>
            </div>
          </section>
          <section className="request-section" aria-labelledby="request-form-title">
            <h2 id="request-form-title" className="type-h2">Данные мероприятия</h2>
            <LeadForm key={format} initialFormat={format} />
            <ButtonLink to="/" variant="text">Вернуться на главную</ButtonLink>
          </section>
        </div>
      </div>
    </main>
  );
}
