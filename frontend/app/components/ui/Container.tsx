import type { HTMLAttributes } from "react";

type ContainerWidth = "default" | "wide" | "narrow" | "form";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  width?: ContainerWidth;
};

const widths: Record<ContainerWidth, string> = {
  default: "container-default",
  wide: "container-wide",
  narrow: "container-narrow",
  form: "container-form",
};

export function Container({ width = "default", className = "", ...props }: ContainerProps) {
  return <div className={`${widths[width]} ${className}`.trim()} {...props} />;
}
