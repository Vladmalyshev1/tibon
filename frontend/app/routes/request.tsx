import { LeadForm } from "../components/pages/LeadForm";
import { PageHero } from "../components/pages/PageHero";
import { PageSection } from "../components/pages/PageSection";
import { ButtonLink } from "../components/ui/Button";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { studioContact } from "../data/business";

export const loader = loadPublicPage;
const requestMeta = serviceMeta({
  title: "Оставить заявку",
  description: "Оставьте заявку на мероприятие в TIBON или позвоните в студию, чтобы согласовать дату и формат.",
  path: "/zayavka/",
});

export const meta: typeof requestMeta = args => [
  ...requestMeta(args), { name: "robots", content: "noindex, follow" },
];

export default function Request() {
  return (
    <main id="main-content" className="information-page" tabIndex={-1}>
      <PageHero className="information-hero request-hero" title="Оставить заявку"
        description="Заполните форму или позвоните в студию, чтобы согласовать дату и формат мероприятия."
        details={<div className="request-contact">
          <a className="button-primary button-md" href={studioContact.phone.href}>Позвонить · {studioContact.phone.label}</a>
          <p>{studioContact.hours}</p>
        </div>}
      />
      <PageSection title="Данные мероприятия" width="form" className="request-section">
        <LeadForm />
        <ButtonLink to="/" variant="text">Вернуться на главную</ButtonLink>
      </PageSection>
    </main>
  );
}
