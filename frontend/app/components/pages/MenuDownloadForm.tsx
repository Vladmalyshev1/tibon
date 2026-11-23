import { useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { menuLeadSchema } from "../../data/lead";
import type { MenuType } from "../../data/menu";
import { downloadMenuPdf, submitLead } from "../../lib/leadApi";
import { useHydrated } from "../../lib/useHydrated";
import { Button } from "../ui/Button";
import { IconInputControl } from "./IconInputControl";
import { LineIcon } from "../ui/LineIcon";

const menus = {
  adults: "Скачать взрослое меню",
  kids: "Скачать детское меню",
};

export function MenuDownloadForm({ current }: { current: MenuType }) {
  const labelId = useId();
  const alternate = current === "adults" ? "kids" : "adults";
  const enabled = useHydrated();
  const [fields, setFields] = useState({ name: "", phone: "", consent: false });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean }>();
  const inFlight = useRef(false);
  const attempts = useRef(new Map<string, { key: string; id?: string }>());
  const details = menuLeadSchema.safeParse(fields);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || !details.success || inFlight.current) return;
    const button = (event.nativeEvent as SubmitEvent).submitter;
    const type = button instanceof HTMLButtonElement && (button.value === "kids" || button.value === "adults")
      ? button.value : current;
    const body = JSON.stringify({ ...details.data, format: type, source: `menu_${type}` });
    inFlight.current = true;
    setBusy(true);
    setFeedback(undefined);
    try {
      const known = attempts.current.get(body);
      const attempt = known ?? { key: crypto.randomUUID() };
      attempts.current.delete(body);
      attempts.current.set(body, attempt);
      if (attempts.current.size > 8) {
        const oldest = attempts.current.keys().next();
        if (!oldest.done) attempts.current.delete(oldest.value);
      }
      if (!attempt.id) {
        const result = await submitLead(body, attempt.key);
        if (result.kind !== "success") {
          const message = result.kind === "limited"
            ? "Слишком много запросов. Подождите минуту и попробуйте снова."
            : "Не удалось сохранить запрос. Проверьте данные и попробуйте снова.";
          setFeedback({ message, error: true });
          return;
        }
        attempt.id = result.id;
      }
      const pdf = await downloadMenuPdf(attempt.id, attempt.key);
      if (!pdf) {
        setFeedback({ message: "Запрос сохранён. PDF пока недоступен. Повторите скачивание.", error: true });
        return;
      }
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tibon-menu-${type}.pdf`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setFeedback({ message: "Запрос сохранён. Началось скачивание PDF.", error: false });
    } catch {
      setFeedback({ message: "Не удалось завершить скачивание. Попробуйте снова.", error: true });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form className="lead-form menu-download-form" method="post" aria-busy={busy} aria-describedby={labelId} onSubmit={submit} noValidate>
      <p id={labelId} className="menu-download-description">Укажите имя и российский номер телефона, чтобы скачать PDF.</p>
      <noscript><p>Для скачивания меню включите JavaScript.</p></noscript>
      <fieldset className="lead-fields" disabled={!enabled || busy}>
        <label className="lead-field">
          <span>Имя <span className="menu-required">*</span></span>
          <IconInputControl icon="user">
            <input autoComplete="name" required maxLength={80} value={fields.name}
              placeholder="Ваше имя"
              onChange={event => setFields({ ...fields, name: event.currentTarget.value })} />
          </IconInputControl>
        </label>
        <label className="lead-field">
          <span>Телефон <span className="menu-required">*</span></span>
          <IconInputControl icon="phone">
            <input type="tel" autoComplete="tel" required maxLength={24} value={fields.phone}
              placeholder="+7 (___) ___-__-__"
              onChange={event => setFields({ ...fields, phone: event.currentTarget.value })} />
          </IconInputControl>
        </label>
        <div className="menu-consent">
          <label className="lead-consent">
            <input type="checkbox" required checked={fields.consent} aria-describedby={`${labelId}-policy`}
              onChange={event => setFields({ ...fields, consent: event.currentTarget.checked })} />
            <span>Согласен на обработку персональных данных для ответа на запрос *</span>
          </label>
          <Link id={`${labelId}-policy`} to="/politika-konfidencialnosti/">Политика обработки персональных данных</Link>
        </div>
        <Button type="submit" size="lg" value={current} className="menu-primary-download" disabled={!enabled || busy || !details.success}>
          {menus[current]} <LineIcon name="download" />
        </Button>
        <Button type="submit" value={alternate} variant="text" className="menu-alternate-download" disabled={!enabled || busy || !details.success}>
          {menus[alternate]}
        </Button>
      </fieldset>
      {feedback ? <p role={feedback.error ? "alert" : "status"} className={feedback.error ? "lead-error" : undefined}>
        {feedback.message}
      </p> : null}
    </form>
  );
}
