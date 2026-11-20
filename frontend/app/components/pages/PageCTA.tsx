import { ButtonLink } from "../ui/Button";
import type { PageAction } from "./PageHero";
import { PageSection } from "./PageSection";

type PageCTAProps = {
  title: string;
  description?: string;
  overline?: string;
  action: PageAction;
  layout?: "centered" | "inline";
};

export function PageCTA({ title, description, overline, action, layout = "centered" }: PageCTAProps) {
  return (
    <PageSection title={title} description={description} overline={overline} className={`page-cta page-cta-${layout}`}>
      <ButtonLink to={action.to} size="lg">{action.label}</ButtonLink>
    </PageSection>
  );
}
