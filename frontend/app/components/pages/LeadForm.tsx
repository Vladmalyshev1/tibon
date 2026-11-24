import { useEffect, useRef, useState, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import type { RequestFormat } from "../../data/business";
import { isPastStudioDate, requestFormats, resolveLead, type LeadDraft, type LeadFields } from "../../data/lead";
import { leadSubmissionErrors, rememberSubmissionKey, serializeLead, submitLead } from "../../lib/leadApi";
import { useHydrated } from "../../lib/useHydrated";
import { Button } from "../ui/Button";
import { CallbackPhoneInput } from "./CallbackPhoneInput";
import { LeadField } from "./LeadField";

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
export function LeadForm({ initialFormat }: { initialFormat?: RequestFormat }) {
  const enabled = useHydrated();
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [focusRequest, setFocusRequest] = useState<{ field: keyof LeadFields } | null>(null);
  const inFlight = useRef(false);
  const attempts = useRef(new Map<string, string>());
  const success = useRef<HTMLParagraphElement>(null);
  const { control, handleSubmit, register, reset, setError, setFocus, formState: { errors, isSubmitting } } = useForm<LeadFields, undefined, LeadDraft>({
    resolver: resolveLead,
    defaultValues: {
      name: "",
      phone: "+7",
      format: initialFormat ?? "",
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
    const body = serializeLead(draft);
    const previous = attempts.current.get(body);
    if (!previous && isPastStudioDate(draft.date)) {
      setError("date", { type: "validation", message: invalidFields.date });
      setFocusRequest({ field: "date" });
      return;
    }
    const key = rememberSubmissionKey(attempts.current, body);
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
    setSubmitError(leadSubmissionErrors[result.kind]);
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
      setSubmitError(leadSubmissionErrors.unavailable);
    } finally {
      inFlight.current = false;
    }
  }

  function fieldA11y(name: keyof LeadFields) {
    return {
      id: `lead-${name}`,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `lead-${name}-error` : undefined,
    };
  }

  function fieldProps(name: Exclude<keyof LeadFields, "phone">) {
    return { ...fieldA11y(name), ...register(name) };
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
          <LeadField id="lead-name" label="Имя *" error={errors.name?.message} icon="user">
            <input {...fieldProps("name")} autoComplete="name" maxLength={80} required />
          </LeadField>
          <LeadField id="lead-phone" label="Телефон *" error={errors.phone?.message} icon="phone">
            <Controller name="phone" control={control} render={({ field: { onChange, ...field } }) => (
              <CallbackPhoneInput {...fieldA11y("phone")} {...field} onValueChange={onChange} required />
            )} />
          </LeadField>
        </div>
        <div className="lead-pair">
          <LeadField id="lead-format" label="Формат мероприятия *" error={errors.format?.message}>
            <select {...fieldProps("format")} defaultValue={initialFormat ?? ""} required>
              <option value="">Выберите формат</option>
              {requestFormats.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </LeadField>
          <LeadField id="lead-date" label="Желаемая дата" error={errors.date?.message}>
            <input {...fieldProps("date")} type="date" />
          </LeadField>
        </div>
        <LeadField id="lead-guests" label="Количество гостей" error={errors.guests?.message}>
          <input {...fieldProps("guests")} type="number" inputMode="numeric" min={1} max={10_000} step={1} />
        </LeadField>
        <LeadField id="lead-comment" label="Комментарий" error={errors.comment?.message}>
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
