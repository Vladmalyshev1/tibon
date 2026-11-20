import type { ReactNode } from "react";
import { Accordion } from "../ui/Accordion";
import { PageSection } from "./PageSection";

type FAQItem = { id: string; question: string; answer: ReactNode };

export function FAQSection({ title, items }: { title: string; items: readonly FAQItem[] }) {
  if (items.length === 0) return null;

  return (
    <PageSection title={title} width="narrow" className="page-faq">
      <div className="page-faq-items">
        {items.map(({ id, question, answer }) => (
          <Accordion key={id} title={question}>{answer}</Accordion>
        ))}
      </div>
    </PageSection>
  );
}
