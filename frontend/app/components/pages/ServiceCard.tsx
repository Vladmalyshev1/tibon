import type { PageAction } from "./PageHero";
import { ButtonLink } from "../ui/Button";
import { PhotoImage, type Photo } from "../ui/PhotoTile";

type ServiceCardProps = {
  title: string;
  description: string;
  image?: Photo;
  detail?: string;
  action?: PageAction;
};

export function ServiceCard({ title, description, image, detail, action }: ServiceCardProps) {
  return (
    <article className="service-card">
      {image ? <div className="service-card-media"><PhotoImage photo={image} /></div> : null}
      <div className="service-card-body">
        <h3 className="type-h3">{title}</h3>
        <p>{description}</p>
        {detail ? <p className="service-card-detail">{detail}</p> : null}
        {action ? (
          <ButtonLink variant="outline" to={action.to} aria-label={`${action.label}: ${title}`}>
            {action.label} <span aria-hidden="true">↗</span>
          </ButtonLink>
        ) : null}
      </div>
    </article>
  );
}
