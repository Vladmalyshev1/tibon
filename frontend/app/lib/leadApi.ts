import { z } from "zod";

const leadCreated = z.object({ id: z.uuid() });
const invalidLead = z.object({ errors: z.record(z.string(), z.enum(["required", "invalid"])) });

type LeadResult =
  | { kind: "success"; id: string }
  | { kind: "network" | "unavailable" | "limited" | "conflict" }
  | { kind: "validation"; errors: Record<string, "required" | "invalid"> };

export const leadSubmissionErrors = {
  network: "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.",
  limited: "Слишком много попыток. Подождите немного и попробуйте снова.",
  conflict: "Не удалось повторить отправку. Измените данные заявки или позвоните в студию.",
  validation: "Не удалось проверить заявку. Проверьте данные и попробуйте снова.",
  unavailable: "Не удалось отправить заявку. Попробуйте снова или позвоните в студию.",
};

export function serializeLead(draft: Record<string, unknown>) {
  return JSON.stringify({ ...draft, consent_version: "lead-consent-v2" });
}

export function rememberSubmissionKey(attempts: Map<string, string>, body: string) {
  const key = attempts.get(body) ?? crypto.randomUUID();
  attempts.delete(body);
  attempts.set(body, key);
  if (attempts.size > 8) {
    const oldest = attempts.keys().next();
    if (!oldest.done) attempts.delete(oldest.value);
  }
  return key;
}

export async function submitLead(body: string, key: string): Promise<LeadResult> {
  let response: Response;
  try {
    response = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body,
      signal: AbortSignal.timeout(12_000),
      redirect: "error",
      credentials: "omit",
    });
  } catch {
    return { kind: "network" };
  }

  if (response.status === 429) return { kind: "limited" };
  if (response.status === 409) return { kind: "conflict" };

  if ([200, 201, 422].includes(response.status)) {
    const data: unknown = await response.json().catch(() => null);
    if (response.status === 422) {
      const parsed = invalidLead.safeParse(data);
      if (parsed.success) return { kind: "validation", errors: parsed.data.errors };
    } else {
      const parsed = leadCreated.safeParse(data);
      if (parsed.success) return { kind: "success", id: parsed.data.id };
    }
  }
  return { kind: "unavailable" };
}

export async function downloadMenuPdf(id: string, key: string): Promise<Blob | null> {
  try {
    const response = await fetch(`/api/v1/leads/${id}/menu`, {
      headers: { "Idempotency-Key": key },
      signal: AbortSignal.timeout(20_000),
      redirect: "error",
      credentials: "omit",
    });
    if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== "application/pdf") return null;
    return await response.blob();
  } catch {
    return null;
  }
}
