import { useId, type ReactNode } from "react";
import { Section } from "../layout/Section";
import { Container } from "../ui/Container";
import { PhotoImage, type Photo } from "../ui/PhotoTile";
import { SectionHeading } from "../ui/SectionHeading";

type ImageTextSectionProps = {
  title: string;
  overline?: string;
  image: Photo;
  caption?: string;
  imageSide?: "left" | "right";
  className?: string;
  children: ReactNode;
};

export function ImageTextSection({
  title, overline, image, caption, imageSide = "left", className, children,
}: ImageTextSectionProps) {
  const headingId = useId();

  return (
    <Section className={className ? `page-section ${className}` : "page-section"} aria-labelledby={headingId}>
      <Container className={`image-text-layout image-text-${imageSide}`}>
        <div className="image-text-copy">
          <SectionHeading id={headingId} title={title} overline={overline} />
          {children}
        </div>
        <figure>
          <div className="image-text-media"><PhotoImage photo={image} /></div>
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      </Container>
    </Section>
  );
}
