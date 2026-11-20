import type { ReactNode } from "react";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/navigation/Header";
import { studioContact } from "../data/business";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      {children}
      <Footer contact={studioContact} />
    </div>
  );
}
