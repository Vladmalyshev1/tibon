import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

export type TabItem = { id: string; label: string; content: ReactNode };

type TabsProps = { items: TabItem[]; label: string };

export function Tabs({ items, label }: TabsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const baseId = useId();
  const activeIndex = Math.max(items.findIndex((item) => item.id === activeId), 0);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + items.length) % items.length;
    const nextItem = items[nextIndex];
    if (!nextItem) return;
    setActiveId(nextItem.id);
    document.getElementById(`${baseId}-tab-${nextItem.id}`)?.focus();
  }

  if (items.length === 0) return null;
  const activeItem = items[activeIndex];
  if (!activeItem) return null;

  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.id}
            id={`${baseId}-tab-${item.id}`}
            className="tab"
            type="button"
            role="tab"
            aria-selected={activeId === item.id}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={activeId === item.id ? 0 : -1}
            onClick={() => setActiveId(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id={`${baseId}-panel-${activeItem.id}`}
        className="tab-panel"
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeItem.id}`}
        tabIndex={0}
      >
        {activeItem.content}
      </div>
    </div>
  );
}
