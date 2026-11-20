import { useId, type ReactNode } from "react";
import type { To } from "react-router";
import { Section } from "../layout/Section";
import { Breadcrumbs, type BreadcrumbItem } from "../navigation/Breadcrumbs";
import { ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { PhotoImage, type Photo } from "../ui/PhotoTile";
import { SectionHeading } from "../ui/SectionHeading";

export type PageAction = { label: string; to: To };

type PageHeroProps = {
  title: string;
  description?: string;
  overline?: string;
  image?: Photo;
  action?: PageAction;
  breadcrumbs?: readonly BreadcrumbItem[];
  layout?: "split" | "stacked";
  className?: string;
  details?: ReactNode;
  imageCaption?: string;
};

export function PageHero({
  title, description, overline, image, action, breadcrumbs, layout = "split", className = "", details, imageCaption,
}: PageHeroProps) {
  const headingId = useId();

  return (
    <Section className={`page-hero ${className}`.trim()} aria-labelledby={headingId}>
      <Container>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        <div className={`page-hero-layout page-hero-${image ? layout : "text"}`}>
          <div className="page-hero-copy">
            <SectionHeading id={headingId} title={title} level={1} lead={description} overline={overline} />
            {details}
            {action ? <ButtonLink to={action.to} size="lg">{action.label}</ButtonLink> : null}
          </div>
          {image ? (
            <figure className="page-hero-figure">
              <div className="page-hero-media"><PhotoImage photo={image} priority /></div>
              {imageCaption ? <figcaption>{imageCaption}</figcaption> : null}
            </figure>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
