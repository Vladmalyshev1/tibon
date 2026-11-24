import { useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { studioContact } from "../../data/business";
import { menuLeadSchema, type CallbackFields } from "../../data/lead";
import type { MenuType } from "../../data/menu";
import { downloadMenuPdf, leadSubmissionErrors, serializeLead, submitLead } from "../../lib/leadApi";
import { useHydrated } from "../../lib/useHydrated";
import { Button } from "../ui/Button";
import { CallbackPhoneInput } from "./CallbackPhoneInput";
import { LeadField } from "./LeadField";
import { LineIcon } from "../ui/LineIcon";

const menus = {
  adults: "Скачать взрослое меню",
  kids: "Скачать детское меню",
};

const menuRequestErrors = {
  ...leadSubmissionErrors,
  validation: "Не удалось проверить данные для скачивания. Проверьте форму и попробуйте снова.",
  unavailable: "Сервис скачивания временно недоступен. Данные остались в форме. Попробуйте ещё раз.",
};

export function MenuDownloadForm({ current }: { current: MenuType }) {
  const labelId = useId();
  const alternate = current === "adults" ? "kids" : "adults";
  const enabled = useHydrated();
  const [fields, setFields] = useState({ name: "", phone: "+7", consent: false });
  const [touched, setTouched] = useState({ name: false, phone: false, consent: false });
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof CallbackFields, string>>>({});
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean }>();
  const inFlight = useRef(false);
  const attempts = useRef(new Map<string, { key: string; id?: string }>());
  const details = menuLeadSchema.safeParse(fields);
  const issues = details.success ? [] : details.error.issues;
  const nameIssue = issues.find(issue => issue.path[0] === "name");
  const phoneIssue = issues.find(issue => issue.path[0] === "phone");
  const nameError = serverErrors.name ?? (touched.name ? nameIssue?.message : undefined);
  const phoneError = serverErrors.phone ?? (touched.phone && phoneIssue ? "Введите 10 цифр после +7." : undefined);
  const consentError = serverErrors.consent ?? (!fields.consent && (touched.consent || (!nameIssue && !phoneIssue))
    ? "Чтобы скачать меню, отметьте согласие на обработку данных." : undefined);

  function updateField<K extends keyof CallbackFields>(field: K, value: CallbackFields[K]) {
    setFields(previous => ({ ...previous, [field]: value }));
    setServerErrors(previous => previous[field] ? { ...previous, [field]: undefined } : previous);
    setFeedback(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || !details.success || inFlight.current) return;
    const button = (event.nativeEvent as SubmitEvent).submitter;
    const type = button instanceof HTMLButtonElement && (button.value === "kids" || button.value === "adults")
      ? button.value : current;
    const body = serializeLead({ ...details.data, format: type, source: `menu_${type}` });
    inFlight.current = true;
    setBusy(true);
    setFeedback(undefined);
    setServerErrors({});
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
          if (result.kind === "validation") {
            setServerErrors({
              name: result.errors.name ? "Проверьте имя. Введите от 2 до 80 символов." : undefined,
              phone: result.errors.phone ? "Сервер не принял номер. Проверьте 10 цифр после +7." : undefined,
              consent: result.errors.consent ? "Сервер не принял согласие. Снимите отметку и поставьте её снова." : undefined,
            });
          }
          setFeedback({ message: menuRequestErrors[result.kind], error: true });
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
      <p id={labelId} className="menu-download-description">Укажите имя и российский номер телефона, затем отметьте согласие.</p>
      <noscript><p>Для скачивания меню включите JavaScript или позвоните <a className="underline" href={studioContact.phone.href}>{studioContact.phone.label}</a>.</p></noscript>
      <fieldset className="lead-fields" disabled={!enabled || busy}>
        <LeadField id={`${labelId}-name`} label={<>Имя <span className="menu-required">*</span></>} error={nameError} icon="user">
          <input id={`${labelId}-name`} autoComplete="name" required maxLength={80} value={fields.name} placeholder="Ваше имя"
            aria-invalid={nameError ? true : undefined} aria-describedby={nameError ? `${labelId}-name-error` : undefined}
            onBlur={() => setTouched(previous => ({ ...previous, name: true }))}
            onChange={event => updateField("name", event.currentTarget.value)} />
        </LeadField>
        <LeadField id={`${labelId}-phone`} label={<>Телефон <span className="menu-required">*</span></>} error={phoneError} icon="phone">
          <CallbackPhoneInput id={`${labelId}-phone`} required value={fields.phone} placeholder="+7 (___) ___-__-__"
            aria-invalid={phoneError ? true : undefined} aria-describedby={phoneError ? `${labelId}-phone-error` : undefined}
            onBlur={() => setTouched(previous => ({ ...previous, phone: true }))}
            onValueChange={phone => updateField("phone", phone)} />
        </LeadField>
        <div className="menu-consent">
          <label className="lead-consent">
            <input type="checkbox" required checked={fields.consent} aria-invalid={consentError ? true : undefined}
              aria-describedby={consentError ? `${labelId}-policy ${labelId}-consent-error` : `${labelId}-policy`}
              onChange={event => {
                setTouched(previous => ({ ...previous, consent: true }));
                updateField("consent", event.currentTarget.checked);
              }} />
            <span>Согласен на обработку персональных данных для ответа на запрос *</span>
          </label>
          <Link id={`${labelId}-policy`} to="/politika-konfidencialnosti/">Политика обработки персональных данных</Link>
          {consentError ? <p id={`${labelId}-consent-error`} className="lead-error">{consentError}</p> : null}
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
