import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { saveCookieConsent, type CookieConsent } from "../../lib/cookieConsent";
import { Button } from "../ui/Button";

export function CookieConsentBanner({ pending, settingsOpen, onClose }: {
  pending?: boolean;
  settingsOpen?: boolean;
  onClose: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (settingsOpen) heading.current?.focus();
  }, [settingsOpen]);

  function choose(choice: CookieConsent) {
    onClose();
    saveCookieConsent(choice);
  }

  return (
    <aside className="cookie-banner" id="cookie-consent" aria-labelledby="cookie-consent-title" inert={pending}
      onKeyDown={event => {
        if (settingsOpen && event.key === "Escape") onClose();
      }}>
      <div className="cookie-banner-inner">
        <div className="cookie-banner-copy">
          <h2 ref={heading} id="cookie-consent-title" tabIndex={-1}>Настройки cookie</h2>
          <p>
            Сайт запоминает ваш выбор в браузере. Если вы примете дополнительные cookie, на странице контактов
            загрузится карта Яндекса. При отказе вы сможете открыть карту по ссылке.
            {" "}Подробнее — в <Link to="/politika-konfidencialnosti/">Политике обработки персональных данных</Link>.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <Button type="button" size="sm" onClick={() => choose("accepted")}>Принять</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => choose("rejected")}>Отклонить</Button>
        </div>
      </div>
    </aside>
  );
}
