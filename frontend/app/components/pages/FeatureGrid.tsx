type Feature = { id: string; title: string; description: string };

export function FeatureGrid({ items }: { items: readonly Feature[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="feature-grid" role="list">
      {items.map(({ id, title, description }) => (
        <li key={id} className="feature-grid-item">
          <h3 className="type-h3">{title}</h3>
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}
