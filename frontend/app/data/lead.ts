import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { servicePages } from "./business";

const eventFormats = ["adults", "kids", "corporate", "birthday", "romantic", "rental", "extras"] as const;

export const requestFormats = eventFormats.map(id => ({ id, label: servicePages[id].crumb }));

const phoneError = "Введите российский номер из 10 цифр или с префиксом +7 или 8.";
const studioDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Samara", dateStyle: "short" });

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя. Минимум 2 символа.").max(80, "Имя должно быть не длиннее 80 символов."),
  phone: z.string().trim().refine(value => {
    if (!/^(?:\+7)?[\d ().-]+$/.test(value)) return false;
    const digits = value.replace(/\D/g, "");
    return (!value.startsWith("+") && digits.length === 10) || /^[78]\d{10}$/.test(digits);
  }, phoneError).transform(value => `+7${value.replace(/\D/g, "").slice(-10)}`),
  format: z.string().pipe(z.enum(eventFormats, { error: "Выберите формат мероприятия." })),
  date: z.string().refine(value => value === "" || (
    z.iso.date().safeParse(value).success && value >= studioDate.format(new Date())
  ), "Укажите сегодняшнюю или будущую дату.").transform(value => value || undefined),
  comment: z.string().trim().max(1000, "Комментарий должен быть не длиннее 1000 символов.").transform(value => value || undefined),
  consent: z.boolean().refine(Boolean, "Поставьте отметку о согласии."),
});

export type LeadFields = z.input<typeof leadSchema>;
export type LeadDraft = z.output<typeof leadSchema>;

export const resolveLead: Resolver<LeadFields, undefined, LeadDraft> = (values) => {
  const parsed = leadSchema.safeParse(values);
  if (parsed.success) return { values: parsed.data, errors: {} };

  const fields = z.flattenError(parsed.error).fieldErrors;
  const errors = Object.fromEntries(
    Object.entries(fields).map(([field, messages]) => [field, { type: "validation", message: messages[0] }]),
  );
  return { values: {}, errors };
};
