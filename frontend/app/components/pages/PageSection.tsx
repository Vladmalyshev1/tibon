import { useId, type ComponentProps, type ReactNode } from "react";
import { Section } from "../layout/Section";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

type PageSectionProps = {
  title: string;
  overline?: string;
  description?: string;
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: ComponentProps<typeof Section>["tone"];
  width?: ComponentProps<typeof Container>["width"];
};

export function PageSection({
  title, overline, description, children, id, className = "", tone, width,
}: PageSectionProps) {
  const headingId = useId();

  return (
    <Section id={id} tone={tone} className={`page-section ${className}`.trim()} aria-labelledby={headingId}>
      <Container width={width} className="page-section-inner">
        <SectionHeading id={headingId} title={title} overline={overline} lead={description} />
        {children}
      </Container>
    </Section>
  );
}
