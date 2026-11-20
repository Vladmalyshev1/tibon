import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { isPastStudioDate, requestFormats, resolveLead, type LeadDraft, type LeadFields } from "../../data/lead";
import { submitLead } from "../../lib/leadApi";
import { Button } from "../ui/Button";

const subscribe = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

const invalidFields = {
  name: "Укажите имя от 2 до 80 символов.",
  phone: "Проверьте номер телефона.",
  format: "Выберите формат мероприятия.",
  date: "Укажите сегодняшнюю или будущую дату.",
  guests: "Укажите целое число гостей от 1 до 10 000.",
  comment: "Проверьте текст комментария. Максимум 1000 символов.",
  consent: "Поставьте отметку о согласии.",
} satisfies Record<keyof LeadFields, string>;
const fieldNames = Object.keys(invalidFields) as (keyof LeadFields)[];
const maxRememberedAttempts = 8;

function LeadField({ name, label, error, children }: {
  name: keyof LeadFields;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="lead-field">
      <label htmlFor={`lead-${name}`}>{label}</label>
      {children}
      {error ? <p id={`lead-${name}-error`} className="lead-error">{error}</p> : null}
    </div>
  );
}

export function LeadForm() {
  const enabled = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [focusRequest, setFocusRequest] = useState<{ field: keyof LeadFields } | null>(null);
  const inFlight = useRef(false);
  const attempts = useRef(new Map<string, string>());
  const success = useRef<HTMLParagraphElement>(null);
  const { handleSubmit, register, reset, setError, setFocus, formState: { errors, isSubmitting } } = useForm<LeadFields, undefined, LeadDraft>({
    resolver: resolveLead,
    defaultValues: {
      name: "",
      phone: "",
      format: "",
      date: "",
      guests: "",
      comment: "",
      consent: false,
    },
  });

  useEffect(() => {
    if (sent) success.current?.focus();
    if (!isSubmitting && focusRequest) setFocus(focusRequest.field);
  }, [focusRequest, isSubmitting, sent, setFocus]);

  async function send(draft: LeadDraft) {
    const body = JSON.stringify(draft);
    const previous = attempts.current.get(body);
    if (!previous && isPastStudioDate(draft.date)) {
      setError("date", { type: "validation", message: invalidFields.date });
      setFocusRequest({ field: "date" });
      return;
    }
    const key = previous ?? crypto.randomUUID();
    if (previous) attempts.current.delete(body);
    attempts.current.set(body, key);
    if (attempts.current.size > maxRememberedAttempts) {
      const oldest = attempts.current.keys().next();
      if (!oldest.done) attempts.current.delete(oldest.value);
    }
    const result = await submitLead(body, key);
    if (result.kind === "success") {
      attempts.current.clear();
      reset();
      setSent(true);
      return;
    }
    if (result.kind === "validation") {
      attempts.current.delete(body);
      const fields = fieldNames.filter(field => Object.hasOwn(result.errors, field));
      for (const field of fields) {
        setError(field, { type: "server", message: invalidFields[field] });
      }
      if (fields[0]) setFocusRequest({ field: fields[0] });
      if (fields.length && !Object.hasOwn(result.errors, "body")) return;
    }
    setSubmitError({
      network: "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.",
      limited: "Слишком много попыток. Подождите немного и попробуйте снова.",
      conflict: "Не удалось повторить отправку. Измените данные заявки или позвоните в студию.",
      validation: "Не удалось проверить заявку. Проверьте данные и попробуйте снова.",
      unavailable: "Не удалось отправить заявку. Попробуйте снова или позвоните в студию.",
    }[result.kind]);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || inFlight.current || sent) return;
    inFlight.current = true;
    setSubmitError(undefined);
    setFocusRequest(null);
    try {
      await handleSubmit(send)(event);
    } catch {
      setSubmitError("Не удалось отправить заявку. Попробуйте снова или позвоните в студию.");
    } finally {
      inFlight.current = false;
    }
  }

  function fieldProps(name: keyof LeadFields) {
    return {
      id: `lead-${name}`,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `lead-${name}-error` : undefined,
      ...register(name),
    };
  }

  if (sent) {
    return <p ref={success} role="status" tabIndex={-1}>Заявка отправлена. Мы свяжемся с вами, чтобы согласовать дату и детали.</p>;
  }

  return (
    <form className="lead-form" method="post" noValidate onSubmit={onSubmit}
      aria-describedby="lead-mode" aria-busy={isSubmitting}
    >
      <p id="lead-mode">Заявка не является подтверждением бронирования.</p>
      <noscript><p>Для онлайн-отправки включите JavaScript или позвоните в студию.</p></noscript>
      {submitError || Object.keys(errors).length > 0
        ? <p className="lead-error" role="alert">{submitError ?? "Проверьте отмеченные поля."}</p> : null}
      <fieldset className="lead-fields" disabled={!enabled || isSubmitting}>
        <div className="lead-pair">
          <LeadField name="name" label="Имя *" error={errors.name?.message}>
            <input {...fieldProps("name")} autoComplete="name" maxLength={80} required />
          </LeadField>
          <LeadField name="phone" label="Телефон *" error={errors.phone?.message}>
            <input {...fieldProps("phone")} type="tel" autoComplete="tel" maxLength={24} required />
          </LeadField>
        </div>
        <div className="lead-pair">
          <LeadField name="format" label="Формат мероприятия *" error={errors.format?.message}>
            <select {...fieldProps("format")} required>
              <option value="">Выберите формат</option>
              {requestFormats.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </LeadField>
          <LeadField name="date" label="Желаемая дата" error={errors.date?.message}>
            <input {...fieldProps("date")} type="date" />
          </LeadField>
        </div>
        <LeadField name="guests" label="Количество гостей" error={errors.guests?.message}>
          <input {...fieldProps("guests")} type="number" inputMode="numeric" min={1} max={10_000} step={1} />
        </LeadField>
        <LeadField name="comment" label="Комментарий" error={errors.comment?.message}>
          <textarea {...fieldProps("comment")} rows={4} maxLength={1000} />
        </LeadField>
        <div>
          <label className="lead-consent" htmlFor="lead-consent">
            <input {...fieldProps("consent")} type="checkbox" required />
            <span>Согласен на обработку персональных данных для ответа на заявку *</span>
          </label>
          {errors.consent ? <p id="lead-consent-error" className="lead-error">{errors.consent.message}</p> : null}
          <Link to="/politika-konfidencialnosti/">Политика обработки персональных данных</Link>
        </div>
        <Button className="lead-check" variant="secondary" type="submit" disabled={!enabled || isSubmitting}>
          {isSubmitting ? "Отправляем…" : "Отправить заявку"}
        </Button>
      </fieldset>
    </form>
  );
}
