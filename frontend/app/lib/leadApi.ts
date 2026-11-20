import { z } from "zod";

const leadCreated = z.object({ id: z.uuid() });
const invalidLead = z.object({ errors: z.record(z.string(), z.enum(["required", "invalid"])) });

type LeadResult =
  | { kind: "success" | "network" | "unavailable" | "limited" | "conflict" }
  | { kind: "validation"; errors: Record<string, "required" | "invalid"> };

export async function submitLead(body: string, key: string): Promise<LeadResult> {
  let response: Response;
  try {
    response = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body,
      signal: AbortSignal.timeout(12_000),
      redirect: "error",
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
    } else if (leadCreated.safeParse(data).success) {
      return { kind: "success" };
    }
  }
  return { kind: "unavailable" };
}
