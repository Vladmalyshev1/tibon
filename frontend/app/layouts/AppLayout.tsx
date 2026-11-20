import type { ReactNode } from "react";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/navigation/Header";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
