import { useId, type ReactNode } from "react";
import { requestAction, servicePages } from "../../data/business";
import { Breadcrumbs } from "../navigation/Breadcrumbs";
import { ButtonLink } from "../ui/Button";
import { LineIcon } from "../ui/LineIcon";
import { PhotoImage, type Photo } from "../ui/PhotoTile";

export function ReferenceHero({ page, lines, image, caption, children }: {
  page: "kids" | "rental" | "extras";
  lines: readonly string[];
  image: Photo;
  caption?: string;
  children?: ReactNode;
}) {
  const headingId = useId();
  const { crumb, description } = servicePages[page];

  return (
    <section className={`hero reference-hero reference-hero-${page}`} aria-labelledby={headingId}>
      <div className="reference-breadcrumb">
        <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: crumb }]} />
      </div>
      <figure className="reference-hero-image">
        <PhotoImage photo={image} priority />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
      <div className="hero-container reference-hero-content">
        <p className="cinematic-kicker">{crumb}</p>
        <h1 id={headingId} className="type-display">{lines.map((line, index) => (
          <span key={line}>{index > 0 ? " " : ""}{line}</span>
        ))}</h1>
        <p className="type-lead">{description}</p>
        {children}
        <ButtonLink to={requestAction.to} size="lg">{requestAction.label} <LineIcon name="arrow" /></ButtonLink>
      </div>
    </section>
  );
}
