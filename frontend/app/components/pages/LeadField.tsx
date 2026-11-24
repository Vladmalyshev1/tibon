import type { ReactNode } from "react";
import { IconInputControl } from "./IconInputControl";

export function LeadField({ id, label, error, icon, children }: {
  id: string;
  label: ReactNode;
  error?: string;
  icon?: "user" | "phone";
  children: ReactNode;
}) {
  return (
    <div className="lead-field">
      <label htmlFor={id}>{label}</label>
      {icon ? <IconInputControl icon={icon}>{children}</IconInputControl> : children}
      {error ? <p id={`${id}-error`} className="lead-error">{error}</p> : null}
    </div>
  );
}
