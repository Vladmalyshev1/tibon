import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "../ui/Container";

type MainContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  containerWidth?: "default" | "wide" | "narrow" | "form";
};

export function MainContainer({
  children,
  className = "",
  containerWidth = "default",
  ...props
}: MainContainerProps) {
  return (
    <main id="main-content" className={className} {...props}>
      <Container width={containerWidth}>{children}</Container>
    </main>
  );
}
