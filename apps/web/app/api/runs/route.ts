import { isLanguageId, isValidDay, SUBMISSIONS_PER_MINUTE } from "@np/shared";
import { NextResponse } from "next/server";
import type { RunPlanResponse } from "@/lib/api-types";
import { m } from "@/lib/messages";
import { errorResponse } from "@/lib/server/http";
import { getNow } from "@/lib/server/now";
import { createRunPlan } from "@/lib/server/runs";
import { resolveTicket } from "@/lib/server/tickets";
import { getAdminClient, getUser } from "@/lib/supabase/server";

/** Prepara una ejecución en el navegador: casos con datos nuevos, firmados y con caducidad. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { day?: unknown; language?: unknown } | null;
  const { day, language } = body ?? {};
  if (!isValidDay(day) || !isLanguageId(language)) return errorResponse(400, m.api.badRequest);

  const user = await getUser();
  if (!user) return errorResponse(401, m.api.signIn);

  const view = resolveTicket(day, getNow());
  if (view.kind !== "open") return errorResponse(404, m.api.notOpen);

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await getAdminClient()
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if (error) return errorResponse(500, m.api.unexpected);
  if ((count ?? 0) >= SUBMISSIONS_PER_MINUTE) {
    return errorResponse(429, m.api.tooMany(SUBMISSIONS_PER_MINUTE));
  }

  const plan = await createRunPlan({ userId: user.id, day, language, content: view.content });
  if (!plan) return errorResponse(503, m.api.northPoleNotConfigured);
  return NextResponse.json<RunPlanResponse>({ status: "ok", ...plan });
}
