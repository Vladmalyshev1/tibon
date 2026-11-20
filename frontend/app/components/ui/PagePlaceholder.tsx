import { Section } from "../layout/Section";
import { MainContainer } from "../layout/MainContainer";
import { SectionHeading } from "./SectionHeading";

export function PagePlaceholder({ title }: { title: string }) {
  return (
    <MainContainer>
      <Section className="page-placeholder">
        <SectionHeading title={title} level={1} />
        <p className="type-lead">Структурная заготовка страницы. Контент будет добавлен на следующем этапе.</p>
      </Section>
    </MainContainer>
  );
}
