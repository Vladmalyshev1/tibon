import { useSyncExternalStore } from "react";

export type CookieConsent = "accepted" | "rejected";

const storageKey = "tibon.cookie-consent";
const changeEvent = "tibon:cookie-consent";
let sessionChoice: CookieConsent | null = null;

// Reserve the first-visit banner in the first paint, while keeping the SSR markup stable for hydration.
export const cookieConsentFirstPaintScript = `(() => {
  let stored;
  try { stored = localStorage.getItem(${JSON.stringify(storageKey)}); } catch {}
  if (stored !== "accepted" && stored !== "rejected") {
    document.getElementById("cookie-consent-first-paint").sheet.insertRule(":root { --cookie-consent-pending-display: block; }");
  }
})();`;

function readConsent() {
  if (sessionChoice) return sessionChoice;
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function saveCookieConsent(choice: CookieConsent) {
  try {
    window.localStorage.setItem(storageKey, choice);
    sessionChoice = null;
  } catch {
    sessionChoice = choice;
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function useCookieConsent() {
  return useSyncExternalStore(subscribe, readConsent, () => undefined);
}
