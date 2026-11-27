import { useEffect, useRef, useState, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { resolveCallback, type CallbackFields } from "../../data/lead";
import { leadSubmissionErrors, rememberSubmissionKey, serializeLead, submitLead } from "../../lib/leadApi";
import { useHydrated } from "../../lib/useHydrated";
import { Button } from "../ui/Button";
import { LineIcon } from "../ui/LineIcon";
import { CallbackPhoneInput } from "./CallbackPhoneInput";
import { LeadField } from "./LeadField";

const invalidFields = {
  name: "Укажите имя от 2 до 80 символов.",
  phone: "Введите все 10 цифр номера после +7.",
  consent: "Поставьте отметку о согласии.",
};
const fieldNames = Object.keys(invalidFields) as (keyof CallbackFields)[];

export function CallbackForm() {
  const enabled = useHydrated();
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [focusRequest, setFocusRequest] = useState<{ field: keyof CallbackFields }>();
  const inFlight = useRef(false);
  const attempts = useRef(new Map<string, string>());
  const success = useRef<HTMLParagraphElement>(null);
  const { control, handleSubmit, register, reset, setError, setFocus, formState: { errors, isSubmitting } } =
    useForm<CallbackFields>({
      resolver: resolveCallback,
      defaultValues: { name: "", phone: "+7", consent: false },
      shouldFocusError: false,
    });

  useEffect(() => {
    if (sent) success.current?.focus();
    if (!isSubmitting && focusRequest) setFocus(focusRequest.field);
  }, [sent, isSubmitting, focusRequest, setFocus]);

  async function send(draft: CallbackFields) {
    const body = serializeLead({ ...draft, format: "callback" });
    const result = await submitLead(body, rememberSubmissionKey(attempts.current, body));
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
    setFocusRequest(undefined);
    try {
      await handleSubmit(send, invalid => {
        const field = fieldNames.find(name => invalid[name]);
        if (field) setFocusRequest({ field });
      })(event);
    } catch {
      setSubmitError(leadSubmissionErrors.unavailable);
    } finally {
      inFlight.current = false;
    }
  }

  function fieldProps(name: keyof CallbackFields) {
    return {
      id: `callback-${name}`,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `callback-${name}-error` : undefined,
      required: true,
    };
  }

  if (sent) {
    return <p ref={success} role="status" tabIndex={-1}>Заявка принята. Мы перезвоним вам в рабочее время.</p>;
  }

  return (
    <form className="lead-form callback-form" method="post" noValidate onSubmit={onSubmit} aria-busy={isSubmitting}>
      <noscript><p>Для онлайн-отправки включите JavaScript или позвоните в студию.</p></noscript>
      {submitError || Object.keys(errors).length > 0
        ? <p className="lead-error" role="alert">{submitError ?? "Проверьте отмеченные поля."}</p> : null}
      <fieldset className="lead-fields" disabled={!enabled || isSubmitting}>
        <div className="lead-pair">
          <LeadField id="callback-name" label="Имя *" error={errors.name?.message} icon="user">
            <input {...fieldProps("name")} {...register("name")} autoComplete="name" maxLength={80} placeholder="Ваше имя" />
          </LeadField>
          <LeadField id="callback-phone" label="Телефон *" error={errors.phone?.message} icon="phone">
            <Controller name="phone" control={control} render={({ field: { onChange, ...field } }) => (
              <CallbackPhoneInput {...fieldProps("phone")} {...field} onValueChange={onChange} />
            )} />
          </LeadField>
        </div>
        <div className="callback-consent">
          <label className="lead-consent" htmlFor="callback-consent">
            <input {...fieldProps("consent")} {...register("consent")} type="checkbox" />
            <span>Согласен на обработку имени и телефона ИП Исмагиловым Р. С. для обратного звонка, включая возможную
              передачу этих данных через ВКонтакте (VK) для уведомления оператора. *</span>
          </label>
          {errors.consent ? <p id="callback-consent-error" className="lead-error">{errors.consent.message}</p> : null}
          <Link to="/politika-konfidencialnosti/">Политика обработки персональных данных</Link>
        </div>
        <Button className="lead-check" variant="primary" type="submit" disabled={!enabled || isSubmitting}>
          {isSubmitting ? "Отправляем…" : "Перезвоните мне"} <LineIcon name="arrow" />
        </Button>
      </fieldset>
    </form>
  );
}
