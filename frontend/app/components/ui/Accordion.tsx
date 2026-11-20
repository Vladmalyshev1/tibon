import type { ReactNode } from "react";

type AccordionProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  return (
    <details className="accordion" open={defaultOpen}>
      <summary>{title}<span className="accordion-indicator" aria-hidden="true" /></summary>
      <div className="accordion-panel">{children}</div>
    </details>
  );
}
