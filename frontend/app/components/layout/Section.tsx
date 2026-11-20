import type { HTMLAttributes, ReactNode } from "react";

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: "default" | "alternate" | "inverse";
};

export function Section({ children, tone = "default", className = "", ...props }: SectionProps) {
  return (
    <section className={`section section-${tone} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
