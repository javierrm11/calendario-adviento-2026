import { isValidDay } from "@np/shared";
import { NextResponse } from "next/server";
import type { HintResponse } from "@/lib/api-types";
import { m } from "@/lib/messages";
import { errorResponse } from "@/lib/server/http";
import { getNow } from "@/lib/server/now";
import { resolveTicket } from "@/lib/server/tickets";
import { getAdminClient, getUser } from "@/lib/supabase/server";

/** Devuelve la pista de un ticket. Se registra antes de enviarla: a partir de aquí ese día vale media estrella menos. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { day?: unknown } | null;
  const day = body?.day;
  if (!isValidDay(day)) return errorResponse(400, m.api.badRequest);

  const user = await getUser();
  if (!user) return errorResponse(401, m.api.signIn);

  const view = resolveTicket(day, getNow());
  if (view.kind !== "open") return errorResponse(404, m.api.notOpen);

  const { error } = await getAdminClient()
    .from("hint_uses")
    .upsert({ user_id: user.id, day }, { onConflict: "user_id,day", ignoreDuplicates: true });
  if (error) return errorResponse(500, m.api.unexpected);

  return NextResponse.json<HintResponse>({ status: "ok", hint: view.content.hint });
}
