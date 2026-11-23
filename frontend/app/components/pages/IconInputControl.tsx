import type { ReactNode } from "react";
import { LineIcon } from "../ui/LineIcon";

export function IconInputControl({ icon, children }: { icon: "user" | "phone"; children: ReactNode }) {
  return (
    <span className="lead-input-control">
      <LineIcon name={icon} />
      {children}
    </span>
  );
}
