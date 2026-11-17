import { starsFor, verifyRunTicket } from "@np/shared";
import { type CaseOutput, judgeRun } from "@np/tickets";
import { NextResponse } from "next/server";
import type { SubmissionResponse } from "@/lib/api-types";
import { m } from "@/lib/messages";
import { errorResponse } from "@/lib/server/http";
import { getNow } from "@/lib/server/now";
import { northPoleConfig } from "@/lib/server/runs";
import { resolveTicket } from "@/lib/server/tickets";
import { getAdminClient, getUser } from "@/lib/supabase/server";

const MAX_OUTPUTS = 50;
const MAX_ERROR_LENGTH = 2_000;
const UNIQUE_VIOLATION = "23505";

/** Valida lo que manda el navegador: una lista corta de { name, value } o { name, error }. */
function parseOutputs(value: unknown): CaseOutput[] | null {
  if (!Array.isArray(value) || value.length > MAX_OUTPUTS) return null;
  const outputs: CaseOutput[] = [];
  for (const item of value as Array<Record<string, unknown>>) {
    if (typeof item?.name !== "string") return null;
    if (item.error !== undefined && typeof item.error !== "string") return null;
    outputs.push(
      item.error !== undefined
        ? { name: item.name, error: String(item.error).slice(0, MAX_ERROR_LENGTH) }
        : { name: item.name, value: item.value },
    );
  }
  return outputs;
}

/**
 * Juzga una ejecución hecha en el navegador. El servidor calcula la respuesta correcta de cada caso con su semilla;
 * el navegador nunca la ha visto. Cada ejecución se puede enviar una sola vez y la puntuación es idempotente.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { runToken?: unknown; outputs?: unknown } | null;
  const outputs = parseOutputs(body?.outputs);
  if (typeof body?.runToken !== "string" || !outputs) return errorResponse(400, m.api.badRequest);

  const user = await getUser();
  if (!user) return errorResponse(401, m.api.signIn);

  const config = northPoleConfig();
  if (!config) return errorResponse(503, m.api.northPoleNotConfigured);
  const run = await verifyRunTicket(body.runToken, config.secret);
  if (!run || run.userId !== user.id) return errorResponse(400, m.api.runExpired);

  const view = resolveTicket(run.day, getNow());
  if (view.kind !== "open") return errorResponse(404, m.api.notOpen);

  const results = judgeRun(view.meta.id, run.cases, outputs);
  const passed = results.filter((result) => result.ok).length;
  const total = results.length;

  const admin = getAdminClient();
  // run_id es único: una ejecución ya enviada no se puede volver a usar.
  const { error: insertError } = await admin
    .from("submissions")
    .insert({ run_id: run.id, user_id: user.id, day: run.day, language: run.language, passed, total });
  if (insertError?.code === UNIQUE_VIOLATION) return errorResponse(409, m.api.runUsed);
  if (insertError) return errorResponse(500, m.api.unexpected);

  const solved = passed === total;
  let earned = 0;
  if (solved) {
    const { data: hint } = await admin
      .from("hint_uses")
      .select("day")
      .eq("user_id", user.id)
      .eq("day", run.day)
      .maybeSingle();
    const stars = starsFor(view.level, hint !== null);
    // ON CONFLICT DO NOTHING: si ya estaba resuelto en este lenguaje, no devuelve fila y no suma.
    const { data: inserted, error } = await admin
      .from("solves")
      .upsert(
        { user_id: user.id, day: run.day, language: run.language, stars },
        { onConflict: "user_id,day,language", ignoreDuplicates: true },
      )
      .select("stars");
    if (error) return errorResponse(500, m.api.unexpected);
    earned = inserted.length > 0 ? stars : 0;
  }

  return NextResponse.json<SubmissionResponse>({ status: "results", results, passed, total, earned, solved });
}
