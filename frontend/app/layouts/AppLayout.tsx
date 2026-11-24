import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { CookieConsentBanner } from "../components/layout/CookieConsentBanner";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/navigation/Header";
import { studioContact } from "../data/business";
import { useCookieConsent } from "../lib/cookieConsent";
import "../styles/cookie-consent.css";

export function AppLayout({ children }: { children: ReactNode }) {
  const consent = useCookieConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const consentPending = consent === undefined;
  const bannerOpen = consent === null || settingsOpen;

  function openCookieSettings(event: MouseEvent<HTMLButtonElement>) {
    settingsButton.current = event.currentTarget;
    setSettingsOpen(true);
  }

  function closeCookieSettings() {
    restoreFocus.current = true;
    setSettingsOpen(false);
  }

  useEffect(() => {
    if (settingsOpen || !restoreFocus.current) return;
    restoreFocus.current = false;
    const target = settingsButton.current ?? document.getElementById("main-content");
    settingsButton.current = null;
    target?.focus();
  }, [consent, settingsOpen]);

  return (
    <div className="app-shell">
      <Header />
      {(consentPending || consent === null) && !settingsOpen
        ? <CookieConsentBanner pending={consentPending} onClose={closeCookieSettings} /> : null}
      {children}
      <Footer contact={studioContact} cookieBannerOpen={bannerOpen}
        onCookieSettings={consentPending ? undefined : openCookieSettings} />
      {settingsOpen ? <CookieConsentBanner settingsOpen onClose={closeCookieSettings} /> : null}
    </div>
  );
}
