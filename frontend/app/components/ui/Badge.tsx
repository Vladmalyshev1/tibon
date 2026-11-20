import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "accent" | "olive" | "success" | "warning" | "error";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return <span className={`badge badge-${tone} ${className}`.trim()} {...props} />;
}
