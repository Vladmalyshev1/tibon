type SectionHeadingProps = {
  id?: string;
  title: string;
  overline?: string;
  lead?: string;
  level?: 1 | 2 | 3;
};

const headingClass = { 1: "type-display", 2: "type-h2", 3: "type-h3" } as const;

export function SectionHeading({ id, title, overline, lead, level = 2 }: SectionHeadingProps) {
  const Heading = `h${level}` as const;

  return (
    <header className="section-heading">
      {overline ? <p className="type-overline">{overline}</p> : null}
      <Heading id={id} className={headingClass[level]}>{title}</Heading>
      {lead ? <p className="type-lead">{lead}</p> : null}
    </header>
  );
}
