import { MainContainer } from "../components/layout/MainContainer";
import { Section } from "../components/layout/Section";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ButtonLink } from "../components/ui/Button";
import { placeholderMeta } from "../lib/pageMeta";
import { studioContact } from "../data/business";

export function meta() { return placeholderMeta("Оставить заявку"); }
export default function Request() {
  return (
    <MainContainer containerWidth="form">
      <Section>
        <SectionHeading title="Оставить заявку" level={1} lead="Онлайн-заявки пока недоступны. Здесь появится форма после запуска приёма заявок." />
        <p><a className="button-outline button-md" href={studioContact.phone.href}>Позвонить в студию · {studioContact.phone.label}</a></p>
        <p>{studioContact.hours}</p>
        <ButtonLink to="/" variant="text">Вернуться на главную</ButtonLink>
      </Section>
    </MainContainer>
  );
}
